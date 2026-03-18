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
            let { coinType = null,
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
                year = null,

                // Ottoman specific fields
                person,
                issuingState,
                historicalRegion,
                authenticity,

                yearOfLoss,
                yearOfMint,
            } = items[i]

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
                    mint_as_on_coin,

                    person,
                    issuing_state,
                    historical_region,
                    authenticity,

                    year_of_loss_from,
                    year_of_loss_to,
                    year_of_mint_from,
                    year_of_mint_to
                    
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
                    $[mintAsOnCoin],

                    $[person],
                    $[issuingState],
                    $[historicalRegion],
                    $[authenticity],

                    $[yearOfLossFrom],
                    $[yearOfLossTo],
                    $[yearOfMintFrom],
                    $[yearOfMintTo]
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
                mintAsOnCoin,
                // Ottoman specific fields
                person,
                issuingState,
                historicalRegion,
                authenticity,
                yearOfLossFrom: yearOfLoss ? yearOfLoss.from : null,
                yearOfLossTo: yearOfLoss ? yearOfLoss.to : null,
                yearOfMintFrom: yearOfMint ? yearOfMint.from : null,
                yearOfMintTo: yearOfMint ? yearOfMint.to : null,
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
        color = null,
        singleFind = false,
        reliableAttribution = false,
        completeHoard = false,
        ottomanPredominance = false,
        subclassification = "",
        collection = "",
        publication = "",
    } = {}) {

        let { geometry: _loc, properties } = GeoJSON.separate(location)
        location = _loc

        return WriteableDatabase.tx(async t => {
            const { id } = await t.one(`
            INSERT INTO treasure 
                (
                name,
                location,
                properties,
                earliest_year,
                latest_year,
                description,
                color,
                single_find,
                reliable_attribution,
                complete_hoard,
                ottoman_predominance,
                subclassification,
                collection,
                publication
                ) 
            VALUES (
                $[name],
                ${location ? "ST_GeomFromGeoJSON($[location])" : null},
                $[properties],
                $[earliestYear],
                $[latestYear],
                $[description],
                $[color],
                $[singleFind],
                $[reliableAttribution],
                $[completeHoard],
                $[ottomanPredominance],
                $[subclassification],
                $[collection],
                $[publication]
            ) 
            RETURNING treasure.id`, {
                name,
                location,
                earliestYear: timespan.from,
                latestYear: timespan.to,
                description,
                properties,
                color,
                singleFind,
                reliableAttribution,
                completeHoard,
                ottomanPredominance,
                subclassification,
                collection,
                publication,
            })

            await this.insertItems(t, id, items)
            return id
        })

        // 
    }

    static async update(id, {
        name = "",
        location = null,
        items = [],
        timespan = { from: null, to: null },
        description = "",
        color = null,
        singleFind = false,
        reliableAttribution = false,
        completeHoard = false,
        ottomanPredominance = false,
        subclassification = "",
        collection = "",
        publication = "",
    } = {}) {
        if (id == null) throw new Error("Treasure ID is required")

        let { geometry, properties } = GeoJSON.separate(location)
        location = geometry
        return WriteableDatabase.tx(async t => {
            await t.none(`DELETE FROM treasure_item WHERE treasure = $[id]`, { id })
            await t.none(`
                UPDATE treasure SET 
                    name=$[name],
                    location=${location ? "ST_GeomFromGeoJSON($[location])" : null},
                    properties=$[properties],
                    earliest_year=$[earliestYear],
                    latest_year=$[latestYear],
                    description=$[description],
                    color=$[color],
                    
                    single_find = $[singleFind],
                    reliable_attribution = $[reliableAttribution],
                    complete_hoard = $[completeHoard],
                    ottoman_predominance = $[ottomanPredominance],
                    subclassification = $[subclassification],

                    collection = $[collection],
                    publication = $[publication]

                WHERE id=$[id]
            `,
                {
                    name,
                    location,
                    id,
                    earliestYear: timespan.from,
                    latestYear: timespan.to,
                    description,
                    properties,
                    color,
                    singleFind,
                    reliableAttribution,
                    completeHoard,
                    ottomanPredominance,
                    subclassification,
                    collection,
                    publication,
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
        const treasure = (list.length > 0) ? list[0] : null

        if (treasure) {
            treasure.count = treasure.items.reduce((sum, item) => sum + (item.count || 0), 0)
        }

        return treasure
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

        console.log("Listed items: ", items)
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

                t.authenticity,

                t.person,
                t.historical_region,
                t.issuing_state,

                t.year_of_loss_from,
                t.year_of_loss_to,
                t.year_of_mint_from,
                t.year_of_mint_to,
                
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
                        treasure.single_find,
                        treasure.reliable_attribution,
                        treasure.complete_hoard,
                        treasure.ottoman_predominance,
                        treasure.subclassification,
                        treasure.collection,
                        treasure.publication,

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
                treasure.singleFind = treasure.single_find
                treasure.reliableAttribution = treasure.reliable_attribution
                treasure.completeHoard = treasure.complete_hoard
                treasure.ottomanPredominance = treasure.ottoman_predominance
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

            return result
        })

    }

    static async findByName(name, transaction = Database) {
        return transaction.oneOrNone(`SELECT * FROM treasure WHERE name = $1`, [name])
    }
}

class TreasureItem {

    static get nameMap() {
        return {
            "coinType": "cointype",
            "mintRegion": "mint_region",
            "uncertainYear": "uncertain_year",
            "mintRegionUncertain": "mint_region_uncertain",
            "mintAsOnCoin": "mint_as_on_coin",
            // Ottoman specific fields
            "issuingState": "issuing_state",
            "historicalRegion": "historical_region",
            "reliableAttribution": "reliable_attribution",
            "yearOfLossFrom": "year_of_loss_from",
            "yearOfLossTo": "year_of_loss_to",
            "yearOfMintFrom": "year_of_mint_from",
            "yearOfMintTo": "year_of_mint_to",
        }
    }

    static get rangeFields() {
        return {
            yearOfLoss: { type: "range", columns: ["year_of_loss_from", "year_of_loss_to"] },
            yearOfMint: { type: "range", columns: ["year_of_mint_from", "year_of_mint_to"] },
        }
    }

    static getDbName(name) {
        if (TreasureItem.nameMap[name])
            name = TreasureItem.nameMap[name]

        return name
    }

    static filterFields(fields) {
        let set = new Set([
            ...Object.keys(this.rangeFields),
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
                if (TreasureItem.rangeFields[field]) {
                    item[field] = {
                        from: item[TreasureItem.rangeFields[field].columns[0]],
                        to: item[TreasureItem.rangeFields[field].columns[1]],
                    }
                } else {
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

        const PersonModel = new NamedModel("person")
        const HistoricalRegionModel = new NamedModel("historical_region")
        const IssuingStateModel = new NamedModel("state")

        return {
            coinType: async (transaction, id, fields) => {
                const { types } = await Type.getTypes(null, { filters: { id }, postProcessFields: fields.coinType, transaction })
                return (types?.length > 0) ? types[0] : null
            },
            epoch: async (transaction, id) => (new NamedModel("epoch")).get(id, transaction),
            mintRegion: async (transaction, id) => MintRegion.get(id, transaction),
            nominal: async (transaction, id) => Nominal.get(id, transaction),
            material: async (transaction, id) => Material.get(id, { transaction }),

            person: async (transaction, id) => PersonModel.get(id, transaction),
            historicalRegion: async (transaction, id) => HistoricalRegionModel.get(id, transaction),
            issuingState: async (transaction, id) => IssuingStateModel.get(id, transaction),
        }
    }
}

module.exports = Treasure
