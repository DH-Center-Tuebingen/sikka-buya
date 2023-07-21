
//\\ as defined in [[../data/0001a_province.sql]]

const {
    BURGENLAND,
    FRANCE,
    GERMANY,
    PROVINCE_GQL_BODY,
    SAELLAND,
    THE_SEA,
    SAELLAND_UPDATED
} = require('../mockdata/province.mock');
const PropertyTest = require('../src/property-test');

new PropertyTest("province", {
    GQL_BODY: PROVINCE_GQL_BODY,
    listData: [FRANCE, GERMANY, SAELLAND, THE_SEA],
    getData: THE_SEA,
    getDataId: THE_SEA.id,
    searchData: [SAELLAND],
    searchText: "sja",
    searchTextExact: "Sjæ",
    addData: BURGENLAND,
    addInput: `name: "${BURGENLAND.name}"`,
    updateId: SAELLAND.id,
    updateData: SAELLAND_UPDATED,
    updateInput: `name: "${SAELLAND_UPDATED.name}"`,
    deleteId: BURGENLAND.id,
    deleteData: BURGENLAND,
    deletedListData: [FRANCE, GERMANY, SAELLAND_UPDATED, THE_SEA],
}).run()

