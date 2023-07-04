const { WriteableDatabase } = require('../utils/database');
const Material = require('./material');
const Mint = require('./mint');
const { Table } = require('./table.js')
const graphqlFields = require('graphql-fields')

class Treasure extends Table {

    static async insertItems(t, treasure, items) {
        if (items) {
            items.forEach(({
                count = 1,
                fragment = false,
                year = null,
                coin = null,
                treasure = id,
                dynasty = null,
                mint = null,
                nominal = null,
                material = null,
            } = {}) => {

                t.none(`INSERT INTO treasure_item (
                    count,
                    fragment,
                    year,
                    coin,
                    treasure,
                    dynasty,
                    mint,
                    nominal,
                    material
                ) VALUES (
                    $[count],
                    $[fragment],
                    $[year],
                    $[coin],
                    $[treasure],
                    $[dynasty],
                    $[mint],
                    $[nominal],
                    $[material]
                )`, {
                    count,
                    fragment,
                    year,
                    coin,
                    treasure,
                    dynasty,
                    mint,
                    nominal,
                    material,
                })
            })
        }
    }

    static async add({ name = null, items = [], location = null } = {}) {
        return WriteableDatabase.tx(async t => {
            const { id } = await t.one(`INSERT INTO treasure (name, location) VALUES ($[name], $[location]) RETURNING treasure.id`, { name, location })
            await this.insertItems(t, id, items)
        })
    }

    static async update(id, { name = "", location = null, items = [] } = {}) {
        if (id == null) throw new Error("Treasure ID is required")
        return WriteableDatabase.tx(async t => {
            await t.none(`DELETE FROM treasure_item WHERE treasure = $[id]`, { id })
            await t.none(`UPDATE treasure SET name=$[name], location=$[location] WHERE id=$[id]`, { name, location, id })
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
                    ST_AsGeoJSON(treasure.location) AS location,
                    COALESCE(json_agg(items_json) FILTER(where items_json is not null), '[]') AS items
            FROM 
                treasure
                LEFT JOIN(
                        SELECT
                        t.treasure,
                        t.count,
                        t.dynasty,
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

            console.log(treasures[0].items)
            if (requestedFields.items) {

                let foreignFields = {
                    "dynasty": () => { throw new Error("NOT IMPLEMENTED") },
                    "mint": { get: Mint.getById },
                    "nominal": () => { throw new Error("NOT IMPLEMENTED") },
                    "material": {
                        get: Material.get,
                        map: (material) => {
                            return {
                                id: material.material_id,
                                name: material.material_name,
                                color: material.material_color,
                            }
                        }
                    },
                }


                requestedFields = Object.keys(requestedFields.items).filter(key => foreignFields[key])


                for (let treasureIdx = 0; treasureIdx < treasures.length; treasureIdx++) {

                    const treasure = treasures[treasureIdx]

                    for (let fieldIndex = 0; fieldIndex < requestedFields.length; fieldIndex++) {
                        const field = requestedFields[fieldIndex]
                        const cache = {}

                        for (let itemIdx = 0; itemIdx < treasure.items.length; itemIdx++) {
                            const item = treasure.items[itemIdx]

                            if (item[field]) {
                                if (!cache[item[field]] && foreignFields[field].get) {
                                    const result = await foreignFields[field].get(item[field])
                                    if (foreignFields[field].map)
                                        cache[item[field]] = foreignFields[field].map(result)
                                    else
                                        cache[item[field]] = result
                                }

                                item[field] = cache[item[field]]
                            }
                        }
                    }
                }
            }
        })

        return treasures
    }
}

module.exports = Treasure
