
//\\ as defined in [[../data/0001a_province.sql]]

const {
    BURGENLAND,
    FRANCE,
    GERMANY,
    PROVINCE_GQL_BODY,
    SAELLAND,
    THE_SEA,
    SAELLAND_UPDATED,
    TURKEY,
    ROMAN_EMPIRE
} = require('../mockdata/province.mock');
const PropertyTest = require('../src/property-test');

const listData = [FRANCE, GERMANY, ROMAN_EMPIRE, SAELLAND, THE_SEA, TURKEY]

new PropertyTest("province", {
    database: "province",
    GQL_BODY: PROVINCE_GQL_BODY,
    listData: listData,
    getData: THE_SEA,
    getDataId: THE_SEA.id,
    searchData: [SAELLAND],
    searchText: "sja",
    searchTextExact: "Sjæ",
    addData: BURGENLAND,
    addInput: `name: "${BURGENLAND.name}"`,
    updateData: SAELLAND_UPDATED,
    updateInput: `name: "${SAELLAND_UPDATED.name}"`,
    deleteData: SAELLAND,
}).run()

