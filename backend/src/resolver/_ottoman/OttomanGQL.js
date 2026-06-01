const GQL = require('../klasses/gql.js')
const { Database } = require('../../utils/database.js')

class OttomanGQL extends GQL {

    static get Queries() {
        return {
            filterOttomanTreasures: async function (_, { filters } = {}) {
                if (!filters || Object.keys(filters).length === 0) return []


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



                // coinTypeText: String
                // subclassification: String

                // issuingStateRegion: [ID]
                // nominal: [ID]
                // person: ID
                // mintRegion: [ID]
                // historicalRegion: ID
                // yearOfMint: RangeInput
                // yearOfLoss: RangeInput


                const multiSelectFields = [
                    { name: 'historicalRegion', column: 'historical_region', table: 'item' },
                    { name: 'issuingStateRegion', column: 'issuing_state_region', table: 'item' },
                    { name: 'material', column: 'material', table: 'item' },
                    { name: 'mintRegion', column: 'mint_region', table: 'item' },
                    { name: 'nominal', column: 'nominal', table: 'item' },
                    { name: 'person', column: 'person', table: 'item' },
                ]

                multiSelectFields.forEach(({ name, column, table }) => {
                    const andName = `${name}_and`

                    if (filters[andName] && filters[andName].length > 0) {
                        aggregates.push(`array_agg(DISTINCT ${table}.${column}) AS ${andName}`)

                        havingConditions.push(`array_remove(array_agg(DISTINCT ${table}.${column})::text[], NULL) @> ARRAY[\${${andName}:csv}]::text[]`)
                        values[andName] = filters[andName]
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
                if (!text || text.trim() === "") return []
                const results = await Database.manyOrNone(/* sql */`
                    SELECT DISTINCT subclassification FROM treasure
                    WHERE subclassification ILIKE \${text}
                    ORDER BY subclassification
                    LIMIT 10
                `, { text: `%${text}%` })

                return results.map(r => r.subclassification)
            }
        }
    }

    static get Mutations() {
        return {};
    }
}

module.exports = OttomanGQL