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
      yearOfLoss {from to}
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
    { type: "three-way", name: 'single-find', label: 'Single & Hoard Finds', trueLabel: 'Single Finds', falseLabel: 'Hoard Finds', nullLabel: 'Single & Hoard Finds' },

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