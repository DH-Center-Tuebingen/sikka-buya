const { WriteableDatabase, pgp, Database } = require('../utils/database');
const Type = require('../utils/type');
const { GeoJSON } = require('./geojson');
const Material = require('./material');
const MintRegion = require('./mint_region');
const NamedModel = require('./named-model');
const Nominal = require('./nominal');
const Person = require('./person');
const { Table } = require('./table.js')
const graphqlFields = require('graphql-fields')

class Treasure extends Table {

            //     yearOfLoss: { type: "range", columns: ["year_of_loss_from", "year_of_loss_to"] },
            // yearOfLossUncertain: { type: "range", columns: ["year_of_loss_from_uncertain", "year_of_loss_to_uncertain"] },


    static async insertItems(t, treasure, items = []) {
        for (let i = 0; i < items.length; i++) {
            let {
                coinType = null,
                coinTypeText = null,

                count = 1,
                epoch = null,
                reconstructed = false,
                fragment = false,
                material = null,
                materialUncertain = null,

                mintRegion = null,
                mintRegionUncertain = false,

                denominationText = null,
                nominal = null,
                typeOfDenomination = null,
                denominationUncertain = null,

                mintAsOnCoin = null,
                uncertainYear = null,
                weight = null,
                year = null,

                // Ottoman specific fields
                person,
                personUncertain = false,

                issuingState,
                stateUncertain = false,
                issuingStateRegion,

                historicalRegion,

                authenticity,
                statusUncertain = false,

                yearOfLoss,
                yearOfLossUncertain = { from: false, to: false },

                yearOfMint,
                yearOfMintUncertain = { from: false, to: false },

                remarksToCoinTypeReference = null,
                remarks = null,
            } = items[i]

            if (reconstructed == null) reconstructed = false
            if (mintRegionUncertain == null) mintRegionUncertain = false

            await t.none(`INSERT INTO treasure_item (
                    coinType,
                    cointype_text,
                    count,
                    epoch,
                    fragment,
                    material,
                    material_uncertain,

                    mint_region,
                    
                    denomination_text,
                    nominal,
                    type_of_denomination,
                    denomination_uncertain,

                    treasure,
                    uncertain_year,
                    weight,
                    year,
                    reconstructed,
                    mint_region_uncertain,
                    mint_as_on_coin,

                    person,
                    person_uncertain,

                    issuing_state,
                    state_uncertain,
                    issuing_state_region,

                    historical_region,

                    authenticity,
                    status_uncertain,

                    year_of_mint_from,
                    year_of_mint_to,

                    year_of_mint_from_uncertain,
                    year_of_mint_to_uncertain,

                    remarks_to_coin_type_reference,
                    remarks

                ) VALUES (
                    $[coinType],
                    $[coinTypeText],
                    $[count],
                    $[epoch],
                    $[fragment],
                    $[material],
                    $[materialUncertain],
                    $[mintRegion],

                    $[denominationText],
                    $[nominal],
                    $[typeOfDenomination],
                    $[denominationUncertain],
                    
                    $[treasure],
                    $[uncertainYear],
                    $[weight],
                    $[year],
                    $[reconstructed],
                    $[mintRegionUncertain],
                    $[mintAsOnCoin],

                    $[person],
                    $[personUncertain],

                    $[issuingState],
                    $[stateUncertain],
                    $[issuingStateRegion],

                    $[historicalRegion],

                    $[authenticity],
                    $[statusUncertain],

                    $[yearOfMintFrom],
                    $[yearOfMintTo],

                    $[yearOfMintFromUncertain],
                    $[yearOfMintToUncertain],

                    $[remarksToCoinTypeReference],
                    $[remarks]
                )`, {
                coinType,
                coinTypeText,
                count,
                epoch,
                fragment,
                material,
                materialUncertain,
                mintRegion,
                denominationText,
                denominationUncertain,
                nominal,
                treasure: treasure,
                typeOfDenomination,
                mintRegionUncertain,
                uncertainYear,
                weight,
                year,
                reconstructed,
                mintAsOnCoin,
                // Ottoman specific fields
                person,
                personUncertain,
                issuingState,
                stateUncertain,
                issuingStateRegion,
                statusUncertain,
                historicalRegion,
                authenticity,
                yearOfMintFrom: yearOfMint ? yearOfMint.from : null,
                yearOfMintTo: yearOfMint ? yearOfMint.to : null,
                yearOfMintFromUncertain: yearOfMintUncertain ? yearOfMintUncertain.from : false,
                yearOfMintToUncertain: yearOfMintUncertain ? yearOfMintUncertain.to : false,
                remarksToCoinTypeReference,
                remarks,
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
        typeOfFindUncertain = false,
        reliableAttribution = false,
        completeHoard = false,
        ottomanPredominance = false,
        subclassification = "",
        collection = "",
        publication = "",
        yearOfLoss = { from: null, to: null },
        yearOfLossUncertain = { from: false, to: false },
        remarks = null,
        remarksToCoinTypeReference = null,
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
                type_of_find_uncertain,
                reliable_attribution,
                complete_hoard,
                ottoman_predominance,
                subclassification,
                collection,
                publication,
                year_of_loss_from,
                year_of_loss_to,
                year_of_loss_from_uncertain,
                year_of_loss_to_uncertain
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
                $[typeOfFindUncertain],
                $[reliableAttribution],
                $[completeHoard],
                $[ottomanPredominance],
                $[subclassification],
                $[collection],
                $[publication],
                $[yearOfLossFrom],
                $[yearOfLossTo],
                $[yearOfLossFromUncertain],
                $[yearOfLossToUncertain]
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
                typeOfFindUncertain,
                reliableAttribution,
                completeHoard,
                ottomanPredominance,
                subclassification,
                collection,
                publication,
                yearOfLossFrom: yearOfLoss.from,
                yearOfLossTo: yearOfLoss.to,
                yearOfLossFromUncertain: yearOfLossUncertain ? yearOfLossUncertain.from : false,
                yearOfLossToUncertain: yearOfLossUncertain ? yearOfLossUncertain.to : false,
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
        typeOfFindUncertain = false,
        reliableAttribution = false,
        completeHoard = false,
        ottomanPredominance = false,
        subclassification = "",
        collection = "",
        publication = "",
        yearOfLoss = { from: null, to: null },
        yearOfLossUncertain = { from: false, to: false },
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
                    type_of_find_uncertain = $[typeOfFindUncertain],
                    reliable_attribution = $[reliableAttribution],
                    complete_hoard = $[completeHoard],
                    ottoman_predominance = $[ottomanPredominance],
                    subclassification = $[subclassification],

                    collection = $[collection],
                    publication = $[publication],

                    year_of_loss_from = $[yearOfLossFrom],
                    year_of_loss_to = $[yearOfLossTo],
                    year_of_loss_from_uncertain = $[yearOfLossFromUncertain],
                    year_of_loss_to_uncertain = $[yearOfLossToUncertain]

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
                    typeOfFindUncertain,
                    reliableAttribution,
                    completeHoard,
                    ottomanPredominance,
                    subclassification,
                    collection,
                    publication,
                    yearOfLossFrom: yearOfLoss.from,
                    yearOfLossTo: yearOfLoss.to,
                    yearOfLossFromUncertain: yearOfLossUncertain ? yearOfLossUncertain.from : false,
                    yearOfLossToUncertain: yearOfLossUncertain ? yearOfLossUncertain.to : false,
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

        return items
    }

    static get treasureItemQuery() {
        return `SELECT
                t.id,
                t.treasure,
                t.count,
                t.epoch,
                t.coinType,
                t.cointype_text,

                t.mint_region,
                t.year,
                t.nominal,
                t.type_of_denomination,
                t.denomination_uncertain,

                t.material,
                t.material_uncertain,

                t.fragment,
                t.uncertain_year,
                t.weight,
                t.reconstructed,
                t.mint_region_uncertain,
                t.mint_as_on_coin,

                t.authenticity,
                t.status_uncertain,

                t.person,
                t.person_uncertain,

                t.historical_region,
                t.issuing_state,
                t.state_uncertain,
                t.issuing_state_region,

                t.year_of_mint_from,
                t.year_of_mint_to,
                t.year_of_mint_from_uncertain,
                t.year_of_mint_to_uncertain,

                t.remarks,
                t.remarks_to_coin_type_reference,
                
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
                        treasure.type_of_find_uncertain,
                        treasure.reliable_attribution,
                        treasure.complete_hoard,
                        treasure.ottoman_predominance,
                        treasure.subclassification,
                        treasure.collection,
                        treasure.publication,

                        treasure.year_of_loss_from,
                        treasure.year_of_loss_to,
                        treasure.year_of_loss_from_uncertain,
                        treasure.year_of_loss_to_uncertain,

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

            console.log("Fetched treasures: ", treasures[0].items[0].remarks, treasures[0].items[0].remarks_to_coin_type_reference)

            treasures = treasures.map(treasure => {
                treasure.timespan = { from: treasure.earliest_year, to: treasure.latest_year }
                treasure.location = GeoJSON.rebuild(JSON.parse(treasure.location), treasure.properties)
                treasure.singleFind = treasure.single_find
                treasure.typeOfFindUncertain = treasure.type_of_find_uncertain
                treasure.reliableAttribution = treasure.reliable_attribution
                treasure.completeHoard = treasure.complete_hoard
                treasure.ottomanPredominance = treasure.ottoman_predominance
                treasure.yearOfLoss = { from: treasure.year_of_loss_from, to: treasure.year_of_loss_to }
                treasure.yearOfLossUncertain = { from: treasure.year_of_loss_from_uncertain, to: treasure.year_of_loss_to_uncertain }
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
            "coinTypeText": "cointype_text",
            "mintRegion": "mint_region",
            "uncertainYear": "uncertain_year",
            "mintRegionUncertain": "mint_region_uncertain",
            "mintAsOnCoin": "mint_as_on_coin",
            "mintUncertain": "mint_uncertain",
            "personUncertain": "person_uncertain",
            "stateUncertain": "state_uncertain",
            "issuingStateRegion": "issuing_state_region",
            "statusUncertain": "status_uncertain",
            "materialUncertain": "material_uncertain",

            "denominationText": "denomination_text",
            "typeOfDenomination": "type_of_denomination",
            "denominationUncertain": "denomination_uncertain",
            // Ottoman specific fields
            "issuingState": "issuing_state",
            "historicalRegion": "historical_region",
            "reliableAttribution": "reliable_attribution",
            "yearOfMintFrom": "year_of_mint_from",
            "yearOfMintTo": "year_of_mint_to",
            "yearOfMintUncertainFrom": "year_of_mint_from_uncertain",
            "yearOfMintUncertainTo": "year_of_mint_to_uncertain",
            "remarksToCoinTypeReference": "remarks_to_coin_type_reference",
        }
    }

    static get rangeFields() {
        return {
            yearOfMint: { type: "range", columns: ["year_of_mint_from", "year_of_mint_to"] },
            yearOfMintUncertain: { type: "range", columns: ["year_of_mint_from_uncertain", "year_of_mint_to_uncertain"] },
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
            ...Object.keys(this.nameMap)
        ])

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
                    console.log(`Processing field ${field} with db value ${dbValue}`)

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
        const HistoricalRegionModel = new NamedModel("historical_region")
        const IssuingStateModel = new NamedModel("state")
        const IssuingStateRegionModel = new NamedModel("issuing_state_region")

        return {
            epoch: async (transaction, id) => (new NamedModel("epoch")).get(id, transaction),
            mintRegion: async (transaction, id) => MintRegion.get(id, transaction),
            nominal: async (transaction, id) => Nominal.get(id, transaction),
            material: async (transaction, id) => Material.get(id, { transaction }),

            person: async (transaction, id) => Person.get(transaction, id),
            historicalRegion: async (transaction, id) => HistoricalRegionModel.get(id, transaction),
            issuingState: async (transaction, id) => IssuingStateModel.get(id, transaction),
            issuingStateRegion: async (transaction, id) => IssuingStateRegionModel.get(id, transaction),
        }
    }
}

module.exports = Treasure
