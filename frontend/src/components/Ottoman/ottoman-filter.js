import Query from '@/database/query';

export class OttomanFilterType {

    static async filteredQuery({
        filters = {},
        pagination = { count: 20, page: 0 },
        typeBody = "id projectId"
    } = {}, debug = false) {
        const result = await Query.raw(`
    query ($pagination: Pagination, $filters: TypeFilter) {
      coinType(pagination: $pagination, filters: $filters) {
        pageInfo {
          page
          count
          last
          total
        }
        types {
          ${typeBody}
        }
      }
    }
    `, {
            pagination,
            filters
        }, debug)

        return {
            pageInfo: result.data.data.coinType.pageInfo,
            types: result.data.data.coinType.types
        }
    }

}

export const ottomanListTreasuresGQL = `
query {
  treasure {
    id
  	name
    color
    location
    timespan {from to}
    description
    
    items {
      coinType{projectId}
      count
      id
      material {id name color}
      mintRegion {id name}
      nominal {id name}
      yearOfMint {from to}
      person {id name reign {from to}}
      issuingState {id name}
      historicalRegion {id name}
      
      singleFind
      reliableAttribution
      completeHoard
      ottomanPredominance
      
      authenticity
      circumstances
      subclassification
    }
  }
}`

export const ottomanFilterGQL = `

`;

export const ottomanFilterList = [
    { span: 6, type: "three-way", name: 'singleFind', label: 'Single & Hoard Finds', trueLabel: 'Single Finds', falseLabel: 'Hoard Finds', nullLabel: 'Single & Hoard Finds', overwriteNoClass: 'yes' },
    { span: 6, type: "inline-checkbox", name: 'reliableAttribution', label: 'Display only sufficiently published finds' },
    { span: 6, type: "inline-checkbox", name: 'completeHoard', label: 'Display only complete hoard' },
    { span: 6, type: "inline-checkbox", name: 'ottomanPredominance', label: 'Display only hoards consisting predominantly (90%+) of Ottoman coins ' },


    { span: 6, type: "single-select", name: 'subclassification', label: 'Subclassification of finds', mode: 'or' },
    { span: 6, type: "multi-select", name: 'issuingState', label: 'Issuing State' },
    { span: 6, type: "multi-select", name: 'material', label: 'Metal' },
    { span: 6, type: "multi-select", name: 'nominal', label: 'Denomination' },
    {
        span: 6, type: "multi-select", name: 'person', label: 'Issuer (only for Ottoman coins)', displayTextCallback: (item) => {
            let reignTime = "";
            if(item.reign.from != null || item.reign.from != null){
                const from = item.reign.from ?? '?'
                const to = item.reign.to ?? '?'
                reignTime = `(${from} - ${to})`

            }

            return `${item.name} ${reignTime}`
        },
        queryBody: ['id', 'name', { 'reign': ['from', 'to'] }]
    },
    { span: 6, type: "multi-select", name: 'mintRegion', label: 'Mint (only for Ottoman coins)' },
    { span: 6, type: "single-select", name: 'authenticity', label: 'Authenticity of coins', mode: 'or' },
    { span: 6, type: "single-select", name: 'coinTypeText', label: 'Coin type reference (only for Ottoman coins) ', mode: 'or' },
    { span: 6, type: "multi-select", name: 'historicalRegion', label: 'Historical region of coin loss' },

    { span: 6, type: "real-range", name: 'yearOfMint', label: 'Year of Minting', step: 1 },
    { span: 6, type: "real-range", name: 'yearOfLoss', label: 'Year of Loss', step: 1 },
]
/*
    "text": [],
    "number": [],
    "button-group": [],
    "three-way": [
        { type: "three-way", name: 'reliable-attribution', label: 'ottoman.filter.reliable-attribution' },
        { type: "three-way", name: 'complete-hoard', label: 'ottoman.filter.complete-hoard' },
        { type: "three-way", name: 'ottoman-predominance', label: 'ottoman.filter.ottoman-predominance' },
    ],
    "multi-select": [
        { type:"multi-select", name: 'coin-type', label: 'ottoman.filter.coin-type' },
        { type:"multi-select", name: 'material', label: 'ottoman.filter.material' },
        { type:"multi-select", name: 'mint-region', label: 'ottoman.filter.mint' },
        { type:"multi-select", name: 'nominal', label: 'ottoman.filter.denomination' },
        { type:"multi-select", name: 'person', label: 'ottoman.filter.person' },
        { type:"multi-select", name: 'issuing-state', label: 'ottoman.filter.issuing-state' },
        { type:"multi-select", name: 'historical-region', label: 'ottoman.filter.historical-region' },
    ],
    "multi-select-2d": [],
*/
export const ottomanFilterConfig = ottomanFilterList.reduce((acc, input, index) => {
    if (!acc[input.type])
        acc[input.type] = []
    input.order = index
    acc[input.type].push(input)
    return acc
}, {})
