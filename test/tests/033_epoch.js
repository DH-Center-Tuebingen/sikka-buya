const { EPOCH_GQL_BODY, BRONZE_AGE, IRON_AGE, STONE_AGE } = require('../mockdata/epoch.mock')
const PropertyTest = require('../src/property-test')

const epochPropertyTest = new PropertyTest("epoch", {
    GQL_BODY: EPOCH_GQL_BODY,
    listData: [BRONZE_AGE,  STONE_AGE],
    getData: BRONZE_AGE.id,
    getDataId: BRONZE_AGE,
    searchData: [BRONZE_AGE],
    searchText: "bronze",
    searchTextExact: "Bronze",
    addData: DOLLAR,
    addDataId: DOLLAR.id,
    addInput: `name: "${DOLLAR.name}"`,
    updateId: YEN.id,
    updateData: YEN_UPDATED,
    updateInput: `name: "${YEN_UPDATED.name}"`,
    deleteId: DOLLAR.id,
    deleteData: DOLLAR,
    deletedListData: [MARK, TALER, ZLOTY, YEN_UPDATED, ADIE],
})

epochPropertyTest.run()


