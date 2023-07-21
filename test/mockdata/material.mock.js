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



const TITAN = {
    id: "5",
    name: "Titan",
    color: "#030303"
}

const TITAN_UPDATED = {
    id: "5",
    name: "TITAN_BLACK",
    color: "#111111"
}

const PLATIN = {
    id: "6",
    name: "Platin",
    color: "#eeeeee"
}

const MATERIAL_GQL_BODY = `{
    id,
    name
    color
}`

module.exports = {
    COPPER,
    GOLD,
    MATERIAL_GQL_BODY,
    PERLMUTT,
    PLATIN,
    SILVER,
    TITAN_UPDATED,
    TITAN,
}