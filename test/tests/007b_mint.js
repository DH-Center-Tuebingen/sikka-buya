

//\\ as defined in [[../data/0001b_mints.sql]]


const {
    MINT_GQL_BODY,
    BERLIN,
    PARIS,
    ATLANTIS,
    TEST_MINT_INPUT,
    TEST_MINT_DATA,
    ISTANBUL_UPDATED,
    ISTANBUL_UPDATED_INPUT,
    ISTANBUL
} = require('../mockdata/mint.mock');
const PropertyTest = require('../src/property-test');

new PropertyTest("mint", {
    GQL_BODY: MINT_GQL_BODY,
    listData: [ATLANTIS, BERLIN, ISTANBUL, PARIS],
    getData: ATLANTIS,
    getDataId: ATLANTIS.id,
    searchData: [ATLANTIS],
    searchText: "atla",
    searchTextExact: "Ǎt",
    addData: TEST_MINT_DATA,
    addInput: TEST_MINT_INPUT,
    updateId: ISTANBUL.id,
    updateData: ISTANBUL_UPDATED,
    updateInput: ISTANBUL_UPDATED_INPUT,
    deleteId: TEST_MINT_DATA.id,
    deleteData: TEST_MINT_DATA,
    deletedListData: [ATLANTIS, BERLIN, ISTANBUL_UPDATED, PARIS],
}).run()

