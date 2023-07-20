const GOLD = {
    id: "1",
    name: "Gøld",
    color: "#fcba03"
}
const COPPER = {
    id: "2",
    name: "Kupfer",
    color: "#fc3903"
}

const PERLMUTT = {
    id: "3",
    name: "Perlmutt",
    color: "#006eff"
}

const SILVER = {
    id: "4",
    name: "Silber",
    color: "#cccccc"
}


const MATERIAL_START_DATA = {
    "data": {
        "material": [
            GOLD,
            COPPER,
            PERLMUTT,
            SILVER
        ]
    }
}

const MATERIAL_GQL_BODY = `{
    id,
    name
    color
}`

module.exports = {
    GOLD,
    COPPER,
    PERLMUTT,
    SILVER,
    MATERIAL_START_DATA,
    MATERIAL_GQL_BODY,
}