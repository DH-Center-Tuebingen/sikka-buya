const { GOLD, COPPER, PERLMUTT, SILVER } = require('./material.mock')
const { GERMANY_REGION,
    PARIS_REGION,
    ATLANTIS_REGION,
    CONSTANTINOPLE } = require("./mintregion.mock")
const { COIN_TYPE_BODY, GERMAN_TYPE, FRENCH_TYPE } = require('./type.mock')
const { MARK, ZLOTY, ADIE } = require("../mockdata/nominal.mock")
const { STONE_AGE, BRONZE_AGE, IRON_AGE } = require('./epoch.mock')

const GERMAN_TREASURE_ITEM = {
    id: "1",
    coinType: GERMAN_TYPE,
    count: 100,
    fragment: true,
    material: GOLD,
    mintRegion: PARIS_REGION,
    nominal: MARK,
    weight: 0.54,
    year: 20,
    epoch: BRONZE_AGE,
    uncertainYear: null,
    mintRegionUncertain: false,
    mintAsOnCoin: "PAARIS",
    reconstructed: false,
}

const GERMAN_TWO_TREASURE_ITEM = {
    id: "3",
    coinType: GERMAN_TYPE,
    count: 44,
    fragment: false,
    material: SILVER,
    mintRegion: ATLANTIS_REGION,
    nominal: ZLOTY,
    weight: 200,
    year: 1,
    epoch: STONE_AGE,
    uncertainYear: "222[a]",
    mintRegionUncertain: true,
    mintAsOnCoin: "ATL",
    reconstructed: true,
}

const NEU_BERLIN_TREASURE_ITEM = {
    id: "6",
    coinType: FRENCH_TYPE,
    count: 100,
    fragment: true,
    material: COPPER,
    mintRegion: GERMANY_REGION,
    nominal: ZLOTY,
    epoch: IRON_AGE,
    weight: 3,
    year: -200,
    uncertainYear: "xyz",
    mintRegionUncertain: false,
    mintAsOnCoin: null,
    reconstructed: false,
}

const NEU_BERLIN_TREASURE_ITEM_INPUT = `{
    coinType: ${FRENCH_TYPE.id},
    count: 100,
    fragment: true,
    material: ${COPPER.id},
    mintRegion: ${GERMANY_REGION.id},
    nominal: ${ZLOTY.id},
    epoch: ${IRON_AGE.id},
    weight: 3,
    year: -200,
    uncertainYear: "xyz",
    mintRegionUncertain: false,
    mintAsOnCoin: null,
    reconstructed: false,
}`

const ATLANTIS_TREASURE_ITEM_INPUT = ` {
    count: 10,
    fragment: false,
    uncertainYear: "xxx",
    weight: 100,
    year: -2302,
    material: ${PERLMUTT.id},
    nominal: ${ADIE.id},
    mintRegion: ${ATLANTIS_REGION.id},
    coinType: ${FRENCH_TYPE.id},
    epoch: ${IRON_AGE.id},
    mintRegionUncertain: false,
    mintAsOnCoin: "A",
    reconstructed: true,
}`


const ATLANTIS_TREASURE_ITEM = {
    id: "5",
    count: 10,
    fragment: false,
    uncertainYear: "xxx",
    weight: 100,
    year: -2302,
    material: PERLMUTT,
    nominal: ADIE,
    mintRegion: ATLANTIS_REGION,
    coinType: FRENCH_TYPE,
    epoch: IRON_AGE,
    mintRegionUncertain: false,
    mintAsOnCoin: "A",
    reconstructed: true,
}

const ATLANTIS_TWO_TREAURE_ITEM_INPUT = ` {
    count: 12,
    fragment: true,
    uncertainYear: "9[x5]",
    weight: 20.5,
    year: 2011,
    material: 2,
    nominal: 4,
    mintRegion: 3,
    coinType: 2,
    epoch: ${BRONZE_AGE.id},
    mintRegionUncertain: false,
    mintAsOnCoin: "ATLA",
    reconstructed: true,
}
`

const ATLANTIS_TWO_TREAURE_ITEM = {
    id: "4",
    count: 12,
    fragment: true,
    uncertainYear: "9[x5]",
    weight: 20.5,
    year: 2011,
    material: COPPER,
    nominal: ZLOTY,
    mintRegion: ATLANTIS_REGION,
    coinType: FRENCH_TYPE,
    epoch: BRONZE_AGE,
    mintRegionUncertain: false,
    mintAsOnCoin: "ATLA",
    reconstructed: true,
}

const FRENCH_TREASURE_ITEM = {
    id: "6",
    coinType: FRENCH_TYPE,
    count: 100,
    fragment: true,
    material: COPPER,
    mintRegion: GERMANY_REGION,
    nominal: ZLOTY,
    weight: 3,
    year: -200,
    uncertainYear: "xyz",
    epoch: IRON_AGE,
    mintRegionUncertain: false,
    mintAsOnCoin: null,
    reconstructed: false,

}

const ALESIA_TREASURE_ITEM = {
    id: "2",
    coinType: FRENCH_TYPE,
    count: 5,
    fragment: false,
    material: PERLMUTT,
    mintRegion: null,
    nominal: ADIE,
    weight: 3,
    year: null,
    uncertainYear: "23x",
    epoch: IRON_AGE,
    mintRegionUncertain: true,
    mintAsOnCoin: "A",
    reconstructed: false,

}

const TREASURE_ITEM_GQL_BODY = `{
    id
    count
    fragment
    uncertainYear
    weight
    year
    epoch{
        id
        name
    }
    material{
        id
        name
        color
    }
    nominal{
        id
        name
    }
    mintRegion {id name location uncertain}
    coinType { ${COIN_TYPE_BODY} }
    
    mintRegionUncertain
    mintAsOnCoin
    reconstructed

}`

module.exports = {
    ALESIA_TREASURE_ITEM,
    ATLANTIS_TREASURE_ITEM,
    ATLANTIS_TREASURE_ITEM_INPUT,
    ATLANTIS_TWO_TREAURE_ITEM_INPUT,
    ATLANTIS_TWO_TREAURE_ITEM,
    FRENCH_TREASURE_ITEM,
    GERMAN_TREASURE_ITEM,
    GERMAN_TWO_TREASURE_ITEM,
    NEU_BERLIN_TREASURE_ITEM_INPUT,
    NEU_BERLIN_TREASURE_ITEM,
    TREASURE_ITEM_GQL_BODY,
} 