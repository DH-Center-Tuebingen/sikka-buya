const { WriteableDatabase, pgp, Database } = require('../utils/database');
const Type = require('../utils/type');
const Dynasty = require('./dynasty');
const Material = require('./material');
const Mint = require('./mint');
const Nominal = require('./nominal');
const { Table } = require('./table.js')
const graphqlFields = require('graphql-fields')

class Treasure extends Table {

    static async insertItems(t, treasure, items = []) {
        for (let i = 0; i < items.length; i++) {
            const { coinType = null,
                count = 1,
                dynasty = null,
                fragment = false,
                material = null,
                mint = null,
                nominal = null,
                uncertainMint = false,
                uncertainYear = null,
                weight = null,
                year = null } = items[i]

            await t.none(`INSERT INTO treasure_item (
                    coinType,
                    count,
                    dynasty,
                    fragment,
                    material,
                    mint,
                    nominal,
                    treasure,
                    uncertain_mint,
                    uncertain_year,
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
                    $[uncertainMint],
                    $[uncertainYear],
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
                uncertainMint,
                uncertainYear,
                weight,
                year,
            })
        }
    }

    static async add({ name = "", items = [], location = null, timespan = { from: null, to: null }, literature = "" } = {}) {
        return WriteableDatabase.tx(async t => {
            const { id } = await t.one(`INSERT INTO treasure (name, location, earliestYear, latestYear, literature) 
            VALUES (
                $[name],
                ${location ? "ST_GeomFromGeoJSON($[location])" : null},
                $[earliestYear],
                $[latestYear],
                $[literature]) 
            RETURNING treasure.id`, { name, location, earliestYear: timespan.from, latestYear: timespan.to, literature })

            await this.insertItems(t, id, items)
        })

        // 
    }

    static async update(id, { name = "", location = null, items = [], timespan = { from: null, to: null }, literature = "" } = {}) {
        if (id == null) throw new Error("Treasure ID is required")

        return WriteableDatabase.tx(async t => {
            await t.none(`DELETE FROM treasure_item WHERE treasure = $[id]`, { id })
            await t.none(`UPDATE treasure SET 
            name=$[name],
            location=${location ? "ST_GeomFromGeoJSON($[location])" : null},
            earliestYear=$[earliestYear],
            latestYear=$[latestYear],
            literature=$[literature] 
            WHERE id=$[id]`, { name, location, id, earliestYear: timespan.from, latestYear: timespan.to, literature })
            await this.insertItems(t, id, items)
        })
    }

    static async delete(id) {
        return WriteableDatabase.none(`DELETE FROM treasure WHERE id = $[id]`, { id })
    }

    static async get(id, context, info) {
        const list = await this.list(null, { filter: { id } }, context, info)
        return list[0]
    }

    static async listItems(_, { id = null } = {}, context, info) {
        const query = this.treasureItemQuery
        if (id) {
            query += ` WHERE t.treasure = $[id]`
        }

        let items = []
        await Database.tx(async t => {
            items = await t.manyOrNone(query, { id })
            let fields = graphqlFields(info)
            let cache = {}
            items = await TreasureItem.build(t, items, fields, cache)
        })

        return items
    }

    static get treasureItemQuery() {
        return `SELECT
                t.id,
                t.treasure,
                t.count,
                t.dynasty,
                t.coinType,
                t.mint,
                t.year,
                t.nominal,
                t.material,
                t.fragment,
                t.uncertain_year,
                t.uncertain_mint,
                t.weight,
                row_to_json(t) AS items_json
            FROM
                treasure_item AS t`
    }

    static async list(_, args, context, info) {
        const WHERES = []
        if (args.filter) {
            Object.keys(args.filter).forEach(key => {
                switch (key) {
                    case "name":
                        WHERES.push(pgp.as.format(`unaccent(treasure.name) ILIKE unaccent('%$1#%')`, args.filter.name))
                        break
                    case "id":
                        WHERES.push(pgp.as.format(`treasure.id = $1`, args.filter.id))
                        break
                    default:
                        throw new Error(`Unknown filter key: ${key}`)
                }
            })

        }

        let treasures = []
        await Database.tx(async t => {

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
                       ${this.treasureItemQuery}
                    ) AS subquery ON subquery.treasure = treasure.id
                ${WHERES.length > 0 ? `WHERE ${WHERES.join(" AND ")}` : ""}

            GROUP BY treasure.id, treasure.name, treasure.location
            ORDER BY unaccent(treasure.name)
                    `)



            treasures = treasures.map(treasure => {
                treasure.timespan = { from: treasure.earliestyear, to: treasure.latestyear }
                return treasure
            })


            let requestedFields = graphqlFields(info)
            if (requestedFields.items) {
                const cache = {}
                for (let treasureIdx = 0; treasureIdx < treasures.length; treasureIdx++) {
                    const treasure = treasures[treasureIdx]
                    await TreasureItem.build(t, treasure.items, requestedFields.items, cache)
                    treasures[treasureIdx] = treasure
                }
            }
        })

        return treasures
    }
}

class TreasureItem {

    static get nameMap() {
        return {
            "coinType": "cointype",
            "uncertainYear": "uncertain_year",
            "uncertainMint": "uncertain_mint",
        }
    }

    static getDbName(name) {
        if (TreasureItem.nameMap[name])
            name = TreasureItem.nameMap[name]

        return name
    }

    static filterFields(fields) {
        let set = new Set([
            ...Object.keys(this.getters),
            ...Object.keys(this.mappings),
            ...Object.keys(this.nameMap)])

        return Object.keys(fields).filter(key => set.has(key))
    }

    static async build(transaction, items = [], fields, cache = {}) {

        // We filter the fields to only process those who are present and need processing
        const filteredFields = TreasureItem.filterFields(fields)
        for (let fieldIndex = 0; fieldIndex < filteredFields.length; fieldIndex++) {
            const field = filteredFields[fieldIndex]

            for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
                const item = items[itemIdx]


                const dbField = TreasureItem.getDbName(field)
                const dbValue = item[dbField]
                if (dbValue) {
                    if (!cache[field])
                        cache[field] = {}

                    if (!cache[field][dbValue]) {
                        let value = await TreasureItem.get(transaction, field, dbValue, fields)
                        cache[field][dbValue] = TreasureItem.map(field, value)
                    }

                    item[field] = cache[field][dbValue]
                }
            }
        }
        return items
    }

    static async get(transaction, name, value, fields = null) {
        if (TreasureItem.getters[name])
            value = await TreasureItem.getters[name](transaction, value, fields)
        return value
    }

    static map(name, value) {
        if (TreasureItem.mappings[name])
            value = TreasureItem.mappings[name](value)
        return value
    }

    static get mappings() {
        return {
            material: (material) => {
                return {
                    id: material.material_id,
                    name: material.material_name,
                    color: material.material_color,
                }
            }
        }
    }

    static get getters() {
        return {
            coinType: async (transaction, id, fields) => {
                const { types } = await Type.getTypes(null, { filters: { id }, postProcessFields: fields.coinType, transaction })
                return (types?.length > 0) ? types[0] : null
            },
            dynasty: async (transaction, id) => Dynasty.get(id, transaction),
            mint: async (transaction, id) => Mint.getById(id, transaction),
            nominal: async (transaction, id) => Nominal.get(id, transaction),
            material: async (transaction, id) => Material.get(id, { transaction }),
        }
    }
}

module.exports = Treasure
