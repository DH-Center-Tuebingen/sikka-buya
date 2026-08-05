const GQL = require('../klasses/gql.js')
const { Database } = require('../../utils/database.js')

class OttomanGQL extends GQL {

    static get Queries() {
        return {
            filterOttomanTreasures: async function (_, { filters } = {}) {
                if (!filters || Object.keys(filters).length === 0) return null

                const whereConditions = []
                const havingConditions = []
                const values = {}
                const aggregates = []

                // singleFind: Boolean
                // reliableAttribution: Boolean
                // completeHoard: Boolean
                // ottomanPredominance: Boolean

                const booleanFields = {
                    'singleFind': "single_find",
                    'reliableAttribution': "reliable_attribution@treasure",
                    'completeHoard': "complete_hoard@treasure",
                    'ottomanPredominance': "ottoman_predominance@treasure"
                }

                for (const field in booleanFields) {
                    const tableDefinition = booleanFields[field]
                    const [tableName, columnName = "treasure"] = tableDefinition.split("@")

                    const filterValue = filters[field]
                    if (filterValue != null) {
                        whereConditions.push(`${columnName}.${tableName} = \${${tableName}}`)
                        values[tableName] = filterValue
                    }
                }

                const rangeFields = {
                    'yearOfMint': "year_of_mint@item",
                    'yearOfLoss': "year_of_loss@item"
                }

                for (const field in rangeFields) {
                    const tableDefinition = rangeFields[field]
                    const [columnName, tableName = "treasure"] = tableDefinition.split("@")

                    const filterValue = filters[field]
                    if (filterValue != null && (filterValue.from != null || filterValue.to != null)) {
                        const { from, to } = filterValue
                        if (from != null) {
                            whereConditions.push(`${tableName}.${columnName}_from >= \${${field}_from}`)
                            values[`${field}_from`] = from
                        }
                        if (to != null) {
                            whereConditions.push(`${tableName}.${columnName}_to <= \${${field}_to}`)
                            values[`${field}_to`] = to
                        }
                    }
                }

                const stringMultiSelect = [
                    { name: 'subclassification', column: 'subclassification', table: 'treasure' },
                    { name: 'authenticity', column: 'authenticity', table: 'item' },
                    { name: 'coinTypeText', column: 'cointype_text', table: 'item' },
                ]

                const multiSelectFields = [
                    { name: 'historicalRegion', column: 'historical_region', table: 'item' },
                    { name: 'issuingState', column: 'issuing_state', table: 'item' },
                    { name: 'material', column: 'material', table: 'item' },
                    { name: 'mintRegion', column: 'mint_region', table: 'item' },
                    { name: 'nominal', column: 'nominal', table: 'item' },
                    { name: 'person', column: 'person', table: 'item' },
                ]

                stringMultiSelect.forEach(({ name, column, table }) => {
                    if (filters[name] && filters[name].length > 0) {
                        whereConditions.push(`${table}.${column} = ANY(\$[${name}])`)

                        // Value is always the id of the referenced table, so we can safely assume it's a number > 0
                        values[name] = filters[name]
                    }
                })

                multiSelectFields.forEach(({ name, column, table }) => {
                    const andName = `${name}_and`

                    if (filters[andName] && filters[andName].length > 0) {

                        //// This was used to get an OR condition over all the items of a treasure, but by an email on the 3rd june
                        //// it was requested only to show results that match one item. 
                        // aggregates.push(`array_agg(DISTINCT ${table}.${column}) AS ${andName}`)
                        // havingConditions.push(`array_remove(array_agg(DISTINCT ${table}.${column})::text[], NULL) @> ARRAY[\${${andName}:csv}]::text[]`)
                        whereConditions.push(`${table}.${column} = ANY(\$[${andName}])`)

                        // Value is always the id of the referenced table, so we can safely assume it's a number > 0
                        values[andName] = filters[andName].map(strVal => Number(strVal))
                    }
                })

                const query = /* sql */`
                    SELECT treasure.id, count(*) 
                        ${aggregates.length > 0 ? ", " + aggregates.join(", ") : ""}
                    FROM treasure_item item
                    LEFT JOIN treasure ON item.treasure = treasure.id
                `

                const builtQuery =  /* sql */`
                    ${query}
                    ${whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : ""}
                    GROUP BY treasure.id
                    ${havingConditions.length > 0 ? "HAVING " + havingConditions.join(" AND ") : ""}
                `

                const results = await Database.manyOrNone(builtQuery, values)
                const filtered = results.filter(r => +r.count > 0)

                return filtered.map(r => r.id);
            },
            searchSubclassification: async function (_, { text }) {
                const results = await Database.manyOrNone(/* sql */`
                    SELECT DISTINCT subclassification FROM treasure
                    WHERE subclassification ILIKE \${text}
                    ORDER BY subclassification
                    LIMIT 10
                `, { text: `%${text}%` })

                return results.map(r => r.subclassification)

            },
            searchAuthenticity: async function (text) {
                text = (text) ? text : ''
                const results = await Database.manyOrNone(`SELECT DISTINCT authenticity FROM treasure_item WHERE authenticity IS NOT NULL AND authenticity ilike unaccent($1) ORDER BY authenticity;`, [`%${text}%`])
                if (!results) return []
                return results.map(r => r.authenticity)
            },
            searchCoinTypeText: async function (text) {
                text = (text) ? text : ''
                const results = await Database.manyOrNone(`SELECT DISTINCT cointype_text FROM treasure_item WHERE cointype_text IS NOT NULL AND cointype_text ilike unaccent($1) ORDER BY cointype_text;`, [`%${text}%`])
                if (!results) return []
                return results.map(r => r.cointype_text)
            },
        }
    }

    static get Mutations() {
        return {};
    }
}

module.exports = OttomanGQL