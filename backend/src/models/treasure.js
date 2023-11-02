const { WriteableDatabase, pgp, Database } = require('../utils/database');
const Type = require('../utils/type');
const { GeoJSON } = require('./geojson');
const Material = require('./material');
const MintRegion = require('./mint_region');
const NamedModel = require('./named-model');
const Nominal = require('./nominal');
const { Table } = require('./table.js')
const graphqlFields = require('graphql-fields')

class Treasure extends Table {

    static async insertItems(t, treasure, items = []) {
        for (let i = 0; i < items.length; i++) {
            const { coinType = null,
                count = 1,
                epoch = null,
                reconstructed = false,
                fragment = false,
                material = null,
                mintRegion = null,
                nominal = null,
                mintRegionUncertain = null,
                mintAsOnCoin = null,
                uncertainYear = null,
                weight = null,
                year = null } = items[i]

            if (reconstructed == null) reconstructed = false
            if (mintRegionUncertain == null) mintRegionUncertain = false

            await t.none(`INSERT INTO treasure_item (
                    coinType,
                    count,
                    epoch,
                    fragment,
                    material,
                    mint_region,
                    nominal,
                    treasure,
                    uncertain_year,
                    weight,
                    year,
                    reconstructed,
                    mint_region_uncertain,
                    mint_as_on_coin
                ) VALUES (
                    $[coinType],
                    $[count],
                    $[epoch],
                    $[fragment],
                    $[material],
                    $[mintRegion],
                    $[nominal],
                    $[treasure],
                    $[uncertainYear],
                    $[weight],
                    $[year],
                    $[reconstructed],
                    $[mintRegionUncertain],
                    $[mintAsOnCoin]
                )`, {
                coinType,
                count,
                epoch,
                fragment,
                material,
                mintRegion,
                nominal,
                treasure: treasure,
                mintRegionUncertain,
                uncertainYear,
                weight,
                year,
                reconstructed,
                mintAsOnCoin
            })
        }
    }

    static async add({ name = "",
        items = [],
        location = null,
        timespan = {
            from: null,
            to: null
        },
        description = "",
        color = null } = {}) {

        let { geometry: _loc, properties } = GeoJSON.separate(location)
        location = _loc

        return WriteableDatabase.tx(async t => {
            const { id } = await t.one(`INSERT INTO treasure (name, location, properties, earliest_year, latest_year, description, color ) 
            VALUES (
                $[name],
                ${location ? "ST_GeomFromGeoJSON($[location])" : null},
                $[properties],
                $[earliestYear],
                $[latestYear],
                $[description],
                $[color]) 
            RETURNING treasure.id`, { name, location, earliestYear: timespan.from, latestYear: timespan.to, description, properties, color })

            await this.insertItems(t, id, items)
        })

        // 
    }

    static async update(id, { name = "", location = null, items = [], timespan = { from: null, to: null }, description = "", color = null } = {}) {
        if (id == null) throw new Error("Treasure ID is required")

        let { geometry, properties } = GeoJSON.separate(location)
        location = geometry

        return WriteableDatabase.tx(async t => {
            await t.none(`DELETE FROM treasure_item WHERE treasure = $[id]`, { id })
            await t.none(`UPDATE treasure SET 
            name=$[name],
            location=${location ? "ST_GeomFromGeoJSON($[location])" : null},
            properties=$[properties],
            earliest_year=$[earliestYear],
            latest_year=$[latestYear],
            description=$[description],
            color=$[color]
            WHERE id=$[id]`,
                {
                    name,
                    location,
                    id,
                    earliestYear: timespan.from,
                    latestYear: timespan.to,
                    description,
                    properties,
                    color
                }
            )
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
                t.epoch,
                t.coinType,
                t.mint_region,
                t.year,
                t.nominal,
                t.material,
                t.fragment,
                t.uncertain_year,
                t.weight,
                t.reconstructed,
                t.mint_region_uncertain,
                t.mint_as_on_coin,
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
                    treasure.color,
                    treasure.name,
                    treasure.earliest_year,
                    treasure.latest_year,
                    treasure.description,
                    treasure.properties::jsonb AS properties,
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
                treasure.timespan = { from: treasure.earliest_year, to: treasure.latest_year }
                treasure.location = GeoJSON.rebuild(JSON.parse(treasure.location), treasure.properties)
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


    static async treasuresByMints(_, { mintIds = [] } = {}, context, info) {
        if (!mintIds || mintIds.length == 0) return []

        return Database.tx(async t => {
            const result = []

            const treasures = await (`Select id, name, location`)

            for (let id of mintIds) {
                const mint = await MintRegion.get(id, t)

                const treasures = []
                const amountForFind = await t.manyOrNone(`SELECT treasure as treasure_id, SUM(count) AS count from treasure_item WHERE mint_region = $[id] GROUP BY treasure`, { id })

                let totalCount = 0
                for (let { treasure_id, count } of amountForFind) {
                    const treasure = await t.oneOrNone(`SELECT id, name, color, ST_AsGeoJSON(location)::jsonb as location, properties::jsonb as properties  FROM treasure WHERE id = $[treasure_id]`, { treasure_id })

                    treasure.location = GeoJSON.rebuild(treasure.location, treasure.properties)

                    console.log(treasure.location)

                    if (treasure) {
                        treasures.push({
                            treasure,
                            count
                        })

                        totalCount += parseInt(count) || 0
                    }
                }

                result.push({
                    mint,
                    totalCount,
                    treasures
                })
            }
            console.log({ result })

            return result
        })

    }
}

class TreasureItem {

    static get nameMap() {
        return {
            "coinType": "cointype",
            "mintRegion": "mint_region",
            "uncertainYear": "uncertain_year",
            "mintRegionUncertain": "mint_region_uncertain",
            "mintAsOnCoin": "mint_as_on_coin"
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

                if (dbValue != null) {
                    if (!cache[field])
                        cache[field] = {}
                    if (!cache[field][dbValue]) {
                        let value = await TreasureItem.get(transaction, field, dbValue, fields)
                        cache[field][dbValue] = TreasureItem.map(field, value)
                    }
                }

                item[field] = (cache?.[field]?.[dbValue] == null) ? null : cache[field][dbValue]
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
        function toInt(value) {
            const val = parseInt(value)
            return (isNaN(val)) ? null : val
        }

        function toBool(value) {
            return (value) ? true : false
        }

        return {
            year: toInt,
            earliestYear: toInt,
            latestYear: toInt,
            mintRegionUncertain: toBool,
            reconstructed: toBool,
            fragment: toBool,
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
            epoch: async (transaction, id) => (new NamedModel("epoch")).get(id, transaction),
            mintRegion: async (transaction, id) => MintRegion.get(id, transaction),
            nominal: async (transaction, id) => Nominal.get(id, transaction),
            material: async (transaction, id) => Material.get(id, { transaction }),
        }
    }

}

module.exports = Treasure
