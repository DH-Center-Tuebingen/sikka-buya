
const { Database, pgp } = require('../utils/database.js')
const Person = require('../utils/person.js')
const fs = require('fs').promises
const Auth = require("../auth.js")
const Type = require('../utils/type.js')
const Mint = require('../models/mint.js')
const PageGQL = require('./klasses/PageGQL.js')
const CMS = require('../cms.js')
const { findFilesAt } = require('../cms.js')
const { User } = require('../models/user.js')
const Language = require('../language.js')
const Argument = require('../argument.js')
const { guardFunctionObject: guard } = require('../utils/guard.js')



const SuperUserQueries = {
    users: async function (_, args, context) {
        return User.list()
    },
    getUser: async function (_, { id } = {}) {
        Argument.require(id)
        return User.byId(id)
    }
}

const Queries = {
    ping: () => Date.now(),
    locale: async function () {
        const { lc_collate: locale } = await Database.one(`SHOW lc_collate`)
        return locale
    },
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
        Auth.verifyContext(context)



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
        // if (ids.length > process.env.MAX_SEARCH) throw new Error(`Too many ids requested.`)

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
    timelinePlotType: async function (_, { filters, distinct } = {}, context) {

        return (await Type.yearPlot({ distinct, filters }, context))
            .map(({ year_of_mint, count }) => { return { x: parseInt(year_of_mint), y: parseInt(count) } })
            .filter(({ x, y }) => isNaN(x) || isNaN(y) ? false : true)

        // const availableProperties = ["material", "nominal", "procedure"]
        // if (availableProperties.indexOf(name) === -1) throw new Error(`Property '${name}' is not supported (yet)!`)

        // // As we filter the name and it's destined to be one of the 'availableProperties'
        // // it's fine to use it directly in the query.
        // return Database.manyOrNone(`
        //     WITH year_prop_count AS (
        //         SELECT year_of_mint::int as x, ${name}, COUNT(*) as y , array_agg(type.project_id) count FROM type 
        //         WHERE 
        //         -- only relevant for map
        //         exclude_from_map_app = false AND
        //         -- only use years that are valid (should be excluded by above, but humans)
        //         year_of_mint ~ '^[-+]*[0-9]+$' AND
        //         -- exclude if the requested property is null
        //         ${name} IS NOT NULL
        //         -- only include provided ids
        //         ${ids == null ? "" : "AND year_of_mint IN ($ids:csv)"}
        //         GROUP BY year_of_mint , ${name} 
        //         ORDER BY year ASC )
        //     SELECT ${name} as id, array_agg(year) as values FROM year_prop_count
        //     GROUP BY ${name};
        // `, ids)
    },
    async timelineRuledBy(_, {
        rulers = [],
        mints = []
    } = {}) {

        rulers.forEach((value, index) => {
            rulers[index] = parseInt(value)
            if (isNaN(rulers[index])) {
                throw new Error("Only integer values are allowed!")
            }
        })

        mints.forEach((value, index) => {
            mints[index] = parseInt(value)
            if (isNaN(mints[index])) {
                throw new Error("Only integer values are allowed!")
            }
        })

        /* 
                Its not great to manually join the values, but we have the type guard of graphql,
                so it should be fine.
            
                Other workarounds did not work, and wouldn't be much safer, anyways.
                */
        const result = await Database.manyOrNone(`
        WITH arrays as (
            SELECT type.id, project_id, mint, year_of_mint,exclude_from_map_app,
                        array_remove(ARRAY[caliph], null) ||
                        array_remove(ARRAY_AGG( ov.person ),null)  ||
                        array_remove(ARRAY_AGG( i.person ),null) as rulers  FROM type
        LEFT JOIN overlord ov ON ov.type = type.id 
        LEFT JOIN issuer i ON i.type = type.id 
        GROUP BY project_id, type.id, type.caliph, type.mint
        )  
        SELECT  DISTINCT(year_of_mint) from arrays
        WHERE 
        year_of_mint != ''
        AND exclude_from_map_app=False
        AND ARRAY[${rulers.join(",")}] <@ rulers
        ${(mints.length > 0) ? "AND mint IN ($[mints:csv]) " : ""}
        ORDER BY year_of_mint`, {
            mints
        })

        const rulerResult = await Database.manyOrNone(`SELECT  * from person
        LEFT JOIN person_color pc ON pc.person = person.id 
        WHERE id IN ($[rulers:csv])`, { rulers })

        return {
            ruler: rulerResult,
            data: result.map(res => {
                const num = Number(res.year_of_mint)
                return num
            }).filter(year => !isNaN(year))
        }
    },
    async getPersonMints(_, { mints = [], persons = [] } = {}) {

        let whereFilters = []
        if (mints.length > 0) whereFilters.push('mint IN ($[mints:csv])')
        if (persons.length > 0) whereFilters.push(`ruler_id::text[] && ${pgp.as.array(persons)}`)

        const results = await Database.manyOrNone(`
        WITH persons AS(
            WITH types AS (
                WITH persons AS (
                SELECT person.* as id, person_color.color as color, 
                    
                    jsonb_build_object(
                        'id', person.id,  
                        'shortName', person.short_name,
                        'name', person.name,
                        'color', person_color.color,
                        'dynasty', jsonb_build_object(
                            'id', dynasty.id,
                            'name', dynasty.name
                        )
                    ) as json FROM person
                    
                    LEFT JOIN person_color ON person_color.person = person.id
                    LEFT JOIN dynasty ON dynasty.id = person.dynasty
                ), heirs AS (
                    SELECT other_person.type AS type, other_person.person AS person from other_person
                    LEFT JOIN person ON person.id = other_person.person
					LEFT JOIN person_role ON person_role.id = person.role
                    WHERE person_role.name = 'heir'
                )
            SELECT  type.id, type.mint, 
                    coalesce(array_agg(caliph_person.json) filter (where caliph_person.id is not null) , '{}') as caliphs, 
                -- Note here we implemente some special behavior the numismatics wanted:
                -- When there is no issuer, but a caliph, then we use the caliph as issuer.
                coalesce(array_agg(issuer_person.json) filter (where issuer_person.id is not null), 
                         array_agg(caliph_person.json) filter (where caliph_person.id is not null) ,'{}' ) as issuers, 
                coalesce(array_agg(heirs_person.json) filter (where heirs_person.json is not null), '{}') as heirs,
                coalesce(array_agg(overlord_person.json)  filter (where overlord_person.id is not null), '{}')  as overlords,
                coalesce(array_agg(issuer.person) filter (where issuer.person is not null), '{}') as issuer_id,
                coalesce(array_agg(overlord.person) filter (where overlord.person is not null), '{}') as overlord_id,
                coalesce(array_agg(type.caliph) filter (where type.caliph is not null), '{}') as caliphs_id
            FROM type 
            LEFT JOIN issuer ON issuer.type = type.id
            LEFT JOIN overlord ON overlord.type = type.id
            LEFT JOIN persons caliph_person ON caliph_person.id = type.caliph
            LEFT JOIN persons issuer_person ON issuer_person.id = issuer.person 
			LEFT JOIN heirs ON heirs.type = type.id
            LEFT JOIN persons heirs_person ON heirs_person.id = heirs.person
            LEFT JOIN persons overlord_person ON overlord_person.id = overlord.person
            LEFT JOIN other_person ON other_person.type = type.id
            WHERE type.exclude_from_map_app = FALSE
            GROUP BY type.id
                
                ) SELECT 
                
                mint,
                coalesce(array_agg(DISTINCT issuers) filter (where issuers is not null), '{}') as issuers, 
                coalesce(array_agg(DISTINCT overlords) filter (where overlords is not null), '{}') as overlords, 
                coalesce(array_agg(DISTINCT heirs) filter (where heirs is not null), '{}') as heirs,
                coalesce(array_agg(DISTINCT caliphs) filter (where caliphs is not null), '{}') as caliphs
                FROM (SELECT DISTINCT mint, UNNEST(heirs) AS HEIRS, UNNEST(issuers) as issuers, UNNEST(overlords) as overlords, UNNEST(caliphs) as caliphs,  issuer_id || overlord_id || caliphs_id  as ruler_id FROM types) persons
                JOIN mint m ON m.id = mint
                JOIN province p ON m.province = p.id
                ${(whereFilters.length > 0) ? `WHERE ${whereFilters.join(" AND ")}` : ''}
                GROUP BY persons.mint
                ) SELECT  
                    issuers, 
                    overlords, 
                    caliphs, 
                    heirs,
                    jsonb_build_object(
                        'id', m.id,
                        'name', m.name,
                        'location', m.location,
                        'uncertain', coalesce(m.uncertain,false),
                        'uncertainArea', m.uncertain_area,
                        'province', jsonb_build_object(
                            'id', p.id,
                            'name', p.name
                        ) 
                    ) as mint FROM persons
                    JOIN mint m ON m.id = mint
                    JOIN province p ON m.province = p.id                    
            `, { mints })

        return results
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
    },
    getImage: async function (_, { identity }) {
        if (!identity) throw new Error("Identity must be provided!")
        const { parts, filename } = CMS.decomposeIdentity(identity)
        const matchedFiles = await findFilesAt(parts, filename)
        if (matchedFiles.length === 0) throw new Error("Missing image: " + filename)
        if (matchedFiles.length > 1) throw new Error("Too many matched files.")
        const match = matchedFiles[0]
        return CMS.getPublicPath(...parts, match)
    },
    i18n() {
        return Language.messages
    }
}

module.exports = Object.assign(Queries,
    guard(SuperUserQueries, (_, __, context) => Auth.requirePermission(context, "super")),
    PageGQL.Queries)