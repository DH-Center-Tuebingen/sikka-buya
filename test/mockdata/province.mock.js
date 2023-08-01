
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

const TURKEY = {
    id: "5",
    name: "Türkiye",
}

const ROMAN_EMPIRE = {
    id: "6",
    name: "Roman Empire",
}

const BURGENLAND = {
    id: "7",
    name: "Burgenland",
}

const PROVINCE_GQL_BODY = `{ id name }`

module.exports = {
    BURGENLAND,
    FRANCE,
    GERMANY,
    PROVINCE_GQL_BODY,
    ROMAN_EMPIRE,
    SAELLAND_UPDATED,
    SAELLAND,
    THE_SEA,
    TURKEY,
}