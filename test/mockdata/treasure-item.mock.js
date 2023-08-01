const { ATLANT, GERMAN, FRENCH, BRIT } = require('./dynasty.mock')
const { GOLD, COPPER, PERLMUTT, SILVER } = require('./material.mock')
const { PARIS, ATLANTIS, BERLIN } = require('./mint.mock')
const { COIN_TYPE_BODY, GERMAN_TYPE, FRENCH_TYPE } = require('./type.mock')
const { MARK, ZLOTY, ADIE } = require("../mockdata/nominal.mock")

const GERMAN_TREASURE_ITEM = {
    id: "1",
    coinType: GERMAN_TYPE,
    count: 100,
    dynasty: GERMAN,
    fragment: true,
    material: GOLD,
    mint: PARIS,
    uncertainMint: null,
    nominal: MARK,
    weight: 0.54,
    year: 20,
    uncertainYear: null
}

const GERMAN_TWO_TREASURE_ITEM = {
    id: "3",
    coinType: GERMAN_TYPE,
    count: 44,
    dynasty: ATLANT,
    fragment: false,
    material: SILVER,
    mint: ATLANTIS,
    uncertainMint: "UNKNOWN",
    nominal: ZLOTY,
    weight: 200,
    year: 1,
    uncertainYear: "222[a]"
}

const NEU_BERLIN_TREASURE_ITEM = {
    id: "6",
    coinType: FRENCH_TYPE,
    count: 100,
    dynasty: FRENCH,
    fragment: true,
    material: COPPER,
    mint: BERLIN,
    nominal: ZLOTY,
    weight: 3,
    year: -200,
    uncertainYear: "xyz",
    uncertainMint: "Neu Berlin",
}

const NEU_BERLIN_TREASURE_ITEM_INPUT = `{
    coinType: ${FRENCH_TYPE.id},
    count: 100,
    dynasty: ${FRENCH.id},
    fragment: true,
    material: ${COPPER.id},
    mint: ${BERLIN.id},
    nominal: ${ZLOTY.id},
    weight: 3,
    year: -200,
    uncertainYear: "xyz",
    uncertainMint: "Neu Berlin",
}`

const ATLANTIS_TREASURE_ITEM_INPUT = ` {
    count: 10,
    fragment: false,
    uncertainYear: "xxx",
    uncertainMint: "Atlantum",
    weight: 100,
    year: -2302,
    dynasty: ${ATLANT.id},
    material: ${PERLMUTT.id},
    nominal: ${ADIE.id},
    mint: ${ATLANTIS.id},
    coinType: ${FRENCH_TYPE.id},
}`


const ATLANTIS_TREASURE_ITEM = {
    id: "5",
    count: 10,
    fragment: false,
    uncertainYear: "xxx",
    uncertainMint: "Atlantum",
    weight: 100,
    year: -2302,
    dynasty: ATLANT,
    material: PERLMUTT,
    nominal: ADIE,
    mint: ATLANTIS,
    coinType: FRENCH_TYPE,
}

const ATLANTIS_TWO_TREAURE_ITEM_INPUT = ` {
    count: 12,
    fragment: true,
    uncertainYear: "9[x5]",
    uncertainMint: "Padianice",
    weight: 20.5,
    year: 2011,
    dynasty: 3,
    material: 2,
    nominal: 4,
    mint: 3,
    coinType: 2,

}
`

const ATLANTIS_TWO_TREAURE_ITEM = {
    id: "4",
    count: 12,
    fragment: true,
    uncertainYear: "9[x5]",
    uncertainMint: "Padianice",
    weight: 20.5,
    year: 2011,
    dynasty: BRIT,
    material: COPPER,
    nominal: ZLOTY,
    mint: ATLANTIS,
    coinType: FRENCH_TYPE,
}

const FRENCH_TREASURE_ITEM = {
    id: "6",
    coinType: FRENCH_TYPE,
    count: 100,
    dynasty: FRENCH,
    fragment: true,
    material: COPPER,
    mint: BERLIN,
    nominal: ZLOTY,
    weight: 3,
    year: -200,
    uncertainYear: "xyz",
    uncertainMint: "Neu Berlin",
}

const ALESIA_TREASURE_ITEM = {
    id: "2",
    coinType: FRENCH_TYPE,
    count: 5,
    dynasty: FRENCH,
    fragment: false,
    material: PERLMUTT,
    mint: null,
    nominal: ADIE,
    weight: 3,
    year: null,
    uncertainYear: "23x",
    uncertainMint: "Alesia",
}

const TREASURE_ITEM_GQL_BODY = `{
    id
    count
    fragment
    uncertainYear
    uncertainMint
    weight
    year
    dynasty{
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
    mint {id name location uncertain uncertainArea province {id name}}
    coinType { ${COIN_TYPE_BODY} }
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