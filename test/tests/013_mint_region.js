const {
    ATLANTIS_REGION,
    CONSTANTINOPLE_REGION,
    GERMANY_REGION,
    PARIS_REGION,
    CONSTANTINOPLE_REGION_UPDATED_INPUT,
    CONSTANTINOPLE_REGION_UPDATED,
    MINT_REGION_GQL_BODY,
    TEST_MINT_REGION_DATA,
    TEST_MINT_REGION_INPUT
} = require('../mockdata/mintregion.mock');
const PropertyTest = require('../src/property-test');

new PropertyTest("mintRegion", {
    GQL_BODY: MINT_REGION_GQL_BODY,

    listData: [
        ATLANTIS_REGION,
        CONSTANTINOPLE_REGION,
        GERMANY_REGION,
        PARIS_REGION,
    ],
    getData: GERMANY_REGION,
    getDataId: GERMANY_REGION.id,
    searchData: [ATLANTIS_REGION],
    searchText: "atla",
    searchTextExact: "Āt",
    addData: TEST_MINT_REGION_DATA,
    addInput: TEST_MINT_REGION_INPUT,
    updateId: CONSTANTINOPLE_REGION.id,
    updateData: CONSTANTINOPLE_REGION_UPDATED,
    updateInput: CONSTANTINOPLE_REGION_UPDATED_INPUT,
    deleteId: TEST_MINT_REGION_DATA.id,
    deleteData: TEST_MINT_REGION_DATA,
    deletedListData: [
        ATLANTIS_REGION,
        CONSTANTINOPLE_REGION_UPDATED,
        GERMANY_REGION,
        PARIS_REGION,
    ],
}).run()