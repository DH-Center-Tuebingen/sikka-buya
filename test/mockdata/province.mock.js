
//\\ as defined in [[../data/0001a_province.sql]]

const FRANCE = {
    id: "1",
    name: "France",
}

const GERMANY = {
    id: "3",
    name: "Germany",
}

const THE_SEA = {
    id: "2",
    name: "The Sea",
}

const SAELLAND_UPDATED = {
    id: "4",
    name: "Skåne län",
}
const SAELLAND = {
    id: "4",
    name: "Sjælland",
}

const BURGENLAND = {
    id: "5",
    name: "Burgenland",
}

const PROVINCE_GQL_BODY = `{ id name }`

module.exports = {
    BURGENLAND,
    FRANCE,
    GERMANY,
    PROVINCE_GQL_BODY,
    SAELLAND,
    SAELLAND_UPDATED,
    THE_SEA,
}