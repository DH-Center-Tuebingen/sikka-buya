

//\\ as defined in [[../data/0001b_mints.sql]]


const {
    MINT_GQL_BODY,
    BERLIN,
    PARIS,
    ATLANTIS,
    TEST_MINT_INPUT,
    TEST_MINT_DATA,
    UPDATED_ATLANTIS,
    MINT_UPDATE_INPUT
} = require('../mockdata/mint.mock');
const PropertyTest = require('../src/property-test');

new PropertyTest("mint", {
    GQL_BODY: MINT_GQL_BODY,
    listData: [ATLANTIS, BERLIN, PARIS],
    getData: ATLANTIS,
    getDataId: ATLANTIS.id,
    searchData: [ATLANTIS],
    searchText: "atla",
    searchTextExact: "Ǎt",
    addData: TEST_MINT_DATA,
    addInput: TEST_MINT_INPUT,
    updateId: ATLANTIS.id,
    updateData: UPDATED_ATLANTIS,
    updateInput: MINT_UPDATE_INPUT,
    deleteId: TEST_MINT_DATA.id,
    deleteData: TEST_MINT_DATA,
    deletedListData: [BERLIN, PARIS, UPDATED_ATLANTIS],
}).run()

