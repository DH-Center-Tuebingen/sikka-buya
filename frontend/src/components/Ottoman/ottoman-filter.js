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

export const ottomanFilterConfig = {
    "text": [],
    "number": [],
    "button-group": [],
    "three-way": [
        { name: 'single-find', label: 'ottoman.filter.single-find' },
        { name: 'reliable-attribution', label: 'ottoman.filter.reliable-attribution' },
        { name: 'complete-hoard', label: 'ottoman.filter.complete-hoard' },
        { name: 'ottoman-predominance', label: 'ottoman.filter.ottoman-predominance' },
    ],
    "multi-select": [
        { name: 'coin-type', label: 'ottoman.filter.coin-type' },
        { name: 'material', label: 'ottoman.filter.material' },
        { name: 'mint-region', label: 'ottoman.filter.mint' },
        { name: 'nominal', label: 'ottoman.filter.denomination' },
        { name: 'person', label: 'ottoman.filter.person' },
        { name: 'issuing-state', label: 'ottoman.filter.issuing-state' },
        { name: 'historical-region', label: 'ottoman.filter.historical-region' },
    ],
    "multi-select-2d": [],
}