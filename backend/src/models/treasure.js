const { WriteableDatabase } = require('../utils/database');
const Type = require('../utils/type');
const Dynasty = require('./dynasty');
const Material = require('./material');
const Mint = require('./mint');
const Nominal = require('./nominal');
const { Table } = require('./table.js')
const graphqlFields = require('graphql-fields')

class Treasure extends Table {

    static async insertItems(t, treasure, items = []) {
        if (items) {
            items.forEach(({
                coinType = null,
                count = 1,
                dynasty = null,
                fragment = false,
                material = null,
                mint = null,
                nominal = null,
                weight = null,
                year = null,
            } = {}) => {

                t.none(`INSERT INTO treasure_item (
                    coinType,
                    count,
                    dynasty,
                    fragment,
                    material,
                    mint,
                    nominal,
                    treasure,
                    weight,
                    year
                ) VALUES (
                    $[coinType],
                    $[count],
                    $[dynasty],
                    $[fragment],
                    $[material],
                    $[mint],
                    $[nominal],
                    $[treasure],
                    $[weight],
                    $[year]
                )`, {
                    coinType,
                    count,
                    dynasty,
                    fragment,
                    material,
                    mint,
                    nominal,
                    treasure: treasure,
                    weight,
                    year,
                })
            })
        }
    }

    static async add({ name = "", items = [], location = null, timespan = { from: null, to: null }, literature = "" } = {}) {
        return WriteableDatabase.tx(async t => {

            const { id } = await t.one(`INSERT INTO treasure (name, location, earliestYear, latestYear, literature) 
            VALUES ($[name], $[location], $[earliestYear], $[latestYear], $[literature]) 
            RETURNING treasure.id`, { name, location, earliestYear: timespan.from, latestYear: timespan.to, literature })
            await this.insertItems(t, id, items)
        })
    }

    static async update(id, { name = "", location = null, items = [], timespan = { from: null, to: null }, literature = "" } = {}) {
        if (id == null) throw new Error("Treasure ID is required")

        console.log(timespan.from, timespan.to, literature)
        return WriteableDatabase.tx(async t => {
            await t.none(`DELETE FROM treasure_item WHERE treasure = $[id]`, { id })
            await t.none(`UPDATE treasure SET 
            name=$[name],
            location=$[location],
            earliestYear=$[earliestYear],
            latestYear=$[latestYear],
            literature=$[literature] 
            WHERE id=$[id]`, { name, location, id, earliestYear: timespan.from, latestYear: timespan.to, literature })
            await this.insertItems(t, id, items)
        })
    }

    static async delete(id) {
        // return WriteableDatabase.none(`DELETE FROM treasure WHERE id = $[id]`, { id })
    }

    static async get(id, context, info) {
        const list = await this.list(null, { filter: { id } }, context, info)
        return list[0]
    }

    static async list(_, args, context, info) {
        const WHERES = []
        if (args.filter) {
            Object.keys(args.filter).forEach(key => {
                switch (key) {
                    case "name":
                        WHERES.push(`treasure.name LIKE '%${args.filter.name}%'`)
                        break
                    case "id":
                        WHERES.push(`treasure.id = ${args.filter.id}`)
                        break
                    default:
                        throw new Error(`Unknown filter key: ${key}`)
                }
            })

        }

        let treasures = []
        await WriteableDatabase.tx(async t => {

            treasures = await t.manyOrNone(`
            SELECT 
            treasure.id,
                    treasure.name,
                    treasure.earliestYear,
                    treasure.latestYear,
                    treasure.literature,
                    ST_AsGeoJSON(treasure.location) AS location,
                    COALESCE(json_agg(items_json) FILTER(where items_json is not null), '[]') AS items
            FROM 
                treasure
                LEFT JOIN(
                        SELECT
                        t.treasure,
                        t.count,
                        t.dynasty,
                        t.coinType,
                        t.mint,
                        t.year,
                        t.nominal,
                        t.material,
                        t.fragment,
                        row_to_json(t) AS items_json
                    FROM
                        treasure_item AS t
                    ) AS subquery ON subquery.treasure = treasure.id
                ${WHERES.length > 0 ? `WHERE ${WHERES.join(" AND ")}` : ""}
            GROUP BY treasure.id, treasure.name, treasure.location
                    `)


            let requestedFields = graphqlFields(info)

            treasures = treasures.map(treasure => {
                treasure.timespan = { from: treasure.earliestyear, to: treasure.latestyear }
                return treasure
            })

            if (requestedFields.items) {
                let foreignFields = {

                    "coinType": { get: (id) => Type.getType(_, { id }, context, info) },
                    "dynasty": { get: Dynasty.get },
                    "mint": { get: Mint.getById.bind(Mint) },
                    "nominal": { get: Nominal.get },
                    "material": {
                        get: Material.get.bind(Mint),
                        map: (material) => {
                            return {
                                id: material.material_id,
                                name: material.material_name,
                                color: material.material_color,
                            }
                        }
                    },
                }

                const apiDbFieldMap = {
                    "coinType": "cointype",
                }


                requestedFields = Object.keys(requestedFields.items).filter(key => foreignFields[key])
                for (let treasureIdx = 0; treasureIdx < treasures.length; treasureIdx++) {
                    const treasure = treasures[treasureIdx]
                    for (let fieldIndex = 0; fieldIndex < requestedFields.length; fieldIndex++) {
                        const field = requestedFields[fieldIndex]
                        const cache = {}


                        for (let itemIdx = 0; itemIdx < treasure.items.length; itemIdx++) {
                            const item = treasure.items[itemIdx]

                            const dbField = apiDbFieldMap[field] || field
                            const dbValue = item[dbField]
                            if (dbValue) {
                                if (!cache[dbValue] && foreignFields[field].get) {
                                    const result = await foreignFields[field].get(dbValue)
                                    if (foreignFields[field].map)
                                        cache[dbValue] = foreignFields[field].map(result)
                                    else
                                        cache[dbValue] = result
                                }

                                item[field] = cache[dbValue]
                            }
                        }
                    }
                    treasures[treasureIdx] = treasure
                }
            }
        })

        return treasures
    }
}

module.exports = Treasure
