
const { Database } = require('../utils/database.js')
const Person = require('../utils/person.js')
const fs = require('fs').promises
const Auth = require("../auth.js")
const Type = require('../utils/type.js')
const Mint = require('../models/mint.js')

const Queries = {
    ping: () => Date.now(),
    environment: () => {
        return (process.env.TEST_ENVIRONMENT) ? "testing" : "production"
    },

    isSuperUserSet: async function () {
        let result
        try {
            result = await Database.one(`SELECT COUNT(*) FROM app_user WHERE super=true`)
            return result.count > 0
        } catch (e) {
            return false
        }
    },
    databaseExists: async function () {
        return new Promise(resolve => {
            Database.connect().then((result) => {
                result.done()
                resolve(true)
            }
            ).catch(() => resolve(false))
        })
    },
    ruledMint: async function (_, { year } = {}) {
        if (!year) throw new Error("Year is a required parameter")

        let mints = await Database.manyOrNone(`
SELECT type.id AS type_id, m.name AS mint_name, ST_AsGeoJSON(m.location) AS mint_location FROM type
INNER JOIN mint m ON m.id = type.mint
WHERE year_of_mint='$[year]'
`, { year })


        for (let mint of Object.values(mints)) {
            let result = await Type.getOverlordsByType(mint.type_id)
            mint.overlords = result || []
        }

        mints = SQLUtils.objectifyList(mints, {
            prefix: "mint_",
            target: "mint",
            keys: [
                "name",
                "location"
            ]
        })

        return mints

    },
    timespan: async () => {
        let range = await Database.manyOrNone(`SELECT year_of_mint FROM type WHERE year_of_mint !='' AND exclude_from_map_app=false;`)
        range = range.map(row => row.year_of_mint).filter(res => res && res.match(/^\d+$/g)).sort()

        if (range.length == 0) throw new Error("Could not get Range!")

        return { from: range[0], to: range[range.length - 1] }
    },
    getCoinType: async function () {
        return Type.getType(...arguments)
    },
    searchCaliph: function () {

        return Person.searchCaliph(...arguments)
    },
    coinType: async function () {
        return Type.list(...arguments)
    },
    getDominion: async function (_, args) {
        const year = args.year
        if (!year) throw new Error(`The query did not provide a year.`)

        let result = await Database.manyOrNone(`
SELECT DISTINCT 
mint.id AS mint_id, 
mint.name AS mint_name, 
ST_AsGeoJSON(mint.location) AS mint_location,
overlord.rank AS overlord_rank,
person.id AS overlord_id,
person.name AS overlord_name,
person.short_name AS overlord_short_name,
person.role AS overlord_role,
person.dynasty AS overlord_dynasty
 FROM overlord
INNER JOIN type ON type.id =overlord.type
inner JOIN person ON person.id = overlord.person
inner join mint ON mint.id = type.mint
WHERE type.year_of_mint='$[year]' and mint.location IS NOT NULL and mint.uncertain IS NOT true
ORDER BY person.id;
`, { year })
        let arr = []


        result.forEach(dominion => {
            const separator = "_"
            const objects = ["mint", "overlord"]
            let obj = {}
            for (let [key, val] of Object.entries(dominion)) {
                let matchedObject = null
                for (let str of objects) {
                    if (key.startsWith(str + separator)) {
                        key = key.replace(str + separator, "")
                        key = SQLUtils.snakeToCamelCase(key)
                        matchedObject = str
                        break
                    }
                }
                if (!matchedObject) continue
                else {
                    if (!obj[matchedObject]) obj[matchedObject] = {}
                    obj[matchedObject][key] = val
                }
            }

            arr.push(obj)
        })



        let dominions = new Map()

        arr.forEach(el => {
            let id = el.overlord.id
            if (!dominions.has(id)) dominions.set(id, { overlord: el.overlord, mints: [] })
            let entries = dominions.get(id)
            entries.mints.push(el.mint)
        })


        return Array.from(dominions.values())
    },
    searchPersonsWithRole: function () {
        return Person.searchWithRole(...arguments)
    },
    searchPersonsWithoutRole: function () { return Person.searchWithoutRole(...arguments) },
    searchType: async function () {
        return Type.searchType(...arguments)
    },
    mintMaterials: async function () {
        let result = await Database.manyOrNone(`SELECT mint.id, mint.name, 
        json_agg(DISTINCT mat.material) AS materials
        FROM type
        LEFT JOIN mint ON mint.id = type.mint
        JOIN (
          SELECT DISTINCT ON (id, "id", "name", "color")
            id, json_build_object('material_id', "id", 'material_name', "name", 'material_color', "color")::jsonb AS material
          FROM material
            LEFT JOIN material_color mc ON mc.material = id 
        ) AS mat ON mat.id = type.material
        GROUP BY type.mint, mint.id, mint.name
        ORDER BY mint.name;
        `)

        return result.map(result => {
            return {
                mint: { id: result.id, name: result.name },
                materials: result.materials.map(mat => {
                    return {
                        id: mat.material_id,
                        name: mat.material_name,
                        color: mat.material_color
                    }
                })
            }
        })

    },
    /**
   * Same as getCoinTypes, but also allow to filter for evaluation filters.
   */
    modGetTypes: async function (_, args, context) {
        Auth.requireAuthContext(context)



        args.additionalRows = [`CASE WHEN tc.type is null
        then False
        else True 
        END AS completed`, `CASE WHEN tr.type is null
        then False
        else True 
        END AS reviewed`]
        args.additionalJoin = `LEFT JOIN type_completed tc ON t.id = tc.type
LEFT JOIN type_reviewed tr ON t.id = tr.type`


        const modTypes = await Type.getTypes(...arguments)
        modTypes.modReview = modTypes.types
        return modTypes
    },
    getTypeComplete: async function (_, { id = null } = {}) {
        const result = await Database.one("SELECT exists(SELECT * FROM type_completed WHERE type=$1)", id);
        return result.exists
    },
    getAnalytics: async function (_, { id = null } = {}) {
        const count = await Database.one("SELECT COUNT(*) as types, COUNT(DISTINCT mint) AS mints, COUNT(DISTINCT year_of_mint) AS years  FROM type", id);

        return {
            typeCount: count.types,
            mintCount: count.mints,
            yearCount: count.years
        }
    },
    login: async function (_, args) {
        const obj = await Auth.login(_, args)
        return obj
    },
    auth: async function (_, args) {
        return Auth.verify(args.token)
    },
    users: async function (_, args, context) {
        let auth = Auth.verifyContext(context)
        if (!auth) {
            throw new Error('You are not authenticated!')
        } else {
            return await Database.manyOrNone("SELECT id, email, super FROM app_user")
        }
    },
    getComments: async function (_, args, context) {
        let auth = Auth.verifyContext(context)
        if (!auth) {
            throw new Error('You are not authenticated!')
        } else {
            let { property,
                propertyId: property_id } = args

            let results = await Database.manyOrNone(
                `SELECT n.*, u.email as user_email FROM comment n 
            LEFT JOIN app_user u ON  n.user_id=u.id 
            WHERE property=$[property] AND property_id=$[property_id]
        `, { property, property_id })


            SQLUtils.objectifyList(results, {
                prefix: "user_",
                target: "user",
                keys: [
                    "id",
                    "email"
                ]
            })

            return results
        }
    },
    getNote: async function (_, args) {
        let { propertyId, property } = args
        let result = await Database.oneOrNone(`SELECT note.text from note WHERE property=$[property] AND property_id=$[propertyId]`, { propertyId, property })
        return result?.text || ""
    },
    getLang: async function (_, args) {
        let { id,
            table,
            lang,
            attr } = args

        const langTable = `${table}_${lang}`
        if (langTables.indexOf(langTable) != -1) {
            let result = await Database.oneOrNone(`SELECT $[attr:name] FROM ${langTable} WHERE id=$[id]`, { attr, id })
            return result[attr]
        } else return ""
    },
    getMaterialColor: async function (_, args) {
        const result = await Database.oneOrNone(`SELECT color FROM material_color WHERE material=$[id]`, args)
        return (result?.color) ? result.color : null
    },
    getPersonExplorerOrder: async function () {
        return Database.manyOrNone(`SELECT position as order, person FROM person_explorer_custom_sorting`)
    },
    fullSearchOnTypes: async function () {
        return Type.fullSearchTypes(...arguments)
    },
    fixDiff: async function () {
        let result = {}
        const stats = await fs.stat("./scripts/out/änderungen_detail.json")
        const json = require("./scripts/out/änderungen_detail.json")
        result.lastModified = stats.mtime
        result.items = json
        return JSON.stringify(result)
    },
    typeCountOfMints: async function (_, args) {
        const ids = args.ids
        if (ids.length > process.env.MAX_SEARCH) throw new Error(`Too many ids requested.`)

        const mintArray = []

        for (let id of ids) {
            const mint = await Mint.getById(id)

            const result = await Database.manyOrNone(`
            SELECT  m.id, m.name,  year_of_mint,  COUNT(*) 
            FROM type 
            LEFT JOIN mint m ON type.mint = m.id 
            WHERE mint=$[id]
            AND year_of_mint~ '^[0-9]+$'
            AND exclude_from_map_app!=True 
            GROUP BY year_of_mint, m.name, m.id
            ORDER BY year_of_mint;`,
                { id })

            mintArray.push({
                mint,
                data: result.map(({ year_of_mint, count }) => {
                    return { x: year_of_mint, y: count }
                }, {})
            })
        }

        return mintArray
    },
    async ruledMintCount(_, {
        rulers = [],
        mints = []
    } = {}) {

        const result = await Database.manyOrNone(`
            WITH objectified AS(
                    WITH counted AS(
                        WITH distinct_year_and_mint AS(
                            WITH rulers AS (SELECT ISSUER.TYPE,
                                ISSUER.PERSON,
                                T.YEAR_OF_MINT,
                                T.MINT,
                                T.EXCLUDE_FROM_MAP_APP
                            FROM ISSUER
                            LEFT JOIN TYPE T ON ISSUER.TYPE = T.ID
                            UNION
                            SELECT OVERLORD.TYPE,
                                OVERLORD.PERSON,
                                T.YEAR_OF_MINT,
                                T.MINT,
                                T.EXCLUDE_FROM_MAP_APP
                            FROM OVERLORD
                            LEFT JOIN TYPE T ON OVERLORD.TYPE = T.ID
                            UNION
                            SELECT OTHER_PERSON.TYPE,
                                OTHER_PERSON.PERSON,
                                T.YEAR_OF_MINT,
                                T.MINT,
                                T.EXCLUDE_FROM_MAP_APP
                            FROM OTHER_PERSON
                            LEFT JOIN TYPE T ON OTHER_PERSON.TYPE = T.ID
                            LEFT JOIN PERSON ON OTHER_PERSON.PERSON = PERSON.ID
                            LEFT JOIN PERSON_ROLE ON PERSON.ROLE = PERSON_ROLE.ID
                            WHERE PERSON_ROLE.NAME='heir'
                            UNION
                            SELECT id as Type, caliph as person, year_of_mint, mint, exclude_from_map_app
                            FROM type)
                    SELECT DISTINCT year_of_mint, person, mint FROM rulers
                    WHERE year_of_mint~ '^[0-9]+$' 
                    AND NOT exclude_from_map_app
                    ${(mints.length > 0) ? "AND mint IN ($[mints:csv])" : ""}
                    ${(rulers.length > 0) ? "AND person IN ($[rulers:csv]) " : ""}
                    ORDER BY person, year_of_mint
                    ) 

                    SELECT year_of_mint, person, COUNT(*) FROM  distinct_year_and_mint
                    GROUP BY year_of_mint, person
                    )
            SELECT person, json_agg(json_build_object('year', year_of_mint, 'count' , count)) AS json 
            FROM counted 
            GROUP BY person
            ) 
            SELECT obj.person as person_id, p.name as person_name, c.color as person_color, json FROM objectified obj
            LEFT JOIN person p ON p.id = obj.person
            LEFT JOIN person_color c ON c.person = obj.person`, {
            rulers,
            mints
        })
        return result.map(obj => {
            let rulersPointArray = {
                ruler: {
                    id: obj.person_id,
                    name: obj.person_name,
                    color: obj.person_color
                },
                data: obj.json.map(obj => {
                    return {
                        x: obj.year,
                        y: obj.count
                    }
                })
            }
            return rulersPointArray
        })
    }
}

module.exports = Queries