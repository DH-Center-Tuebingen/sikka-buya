const { WriteableDatabase } = require('../utils/database');
const Material = require('./material');
const Mint = require('./mint');
const { Table } = require('./table.js')
const graphqlFields = require('graphql-fields')

class Treasure extends Table {
    static async add({ name = null, items = [], location = null } = {}) {
        WriteableDatabase.tx(async t => {

            const { id } = await t.one(`INSERT INTO treasure (name, location) VALUES ($[name], $[location]) RETURNING treasure.id`, { name, location })

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
        })
    }

    static async update({ id, name = "", items = [] } = {}) {
        WriteableDatabase.tx(async t => {
        })
    }

    static async delete(id) {
        // return WriteableDatabase.none(`DELETE FROM treasure WHERE id = $[id]`, { id })
    }

    static async get(id) {

        return WriteableDatabase.oneOrNone(`SELECT *

        
        FROM treasure WHERE id = $[id]`, { id })
    }

    static async list(_, args, context, info) {

        let treasures = []
        await WriteableDatabase.tx(async t => {

            treasures = await t.manyOrNone(`
                SELECT 
                    treasure.name, 
                    ST_AsGeoJSON(treasure.location) AS location,
                    json_agg(items_json) AS items
                FROM 
                    (
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
                    ) AS subquery
                JOIN treasure ON subquery.treasure = treasure.id
                GROUP BY treasure.id, treasure.name, treasure.location
        
        `)


            let requestedFields = graphqlFields(info)

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

        console.log(treasures)
        return treasures
    }
}

module.exports = Treasure
