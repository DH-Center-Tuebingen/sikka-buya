const { EPOCH_GQL_BODY, BRONZE_AGE, IRON_AGE, STONE_AGE, CREATED_AGE, JURA_AGE, UPDATED_JURA_AGE } = require('../mockdata/epoch.mock')
const PropertyTest = require('../src/property-test')

const epochPropertyTest = new PropertyTest("epoch", {
    GQL_BODY: EPOCH_GQL_BODY,
    listData: [BRONZE_AGE, IRON_AGE, JURA_AGE, STONE_AGE],
    getData: BRONZE_AGE,
    getDataId: BRONZE_AGE.id,
    searchData: [BRONZE_AGE],
    searchText: "bronze",
    searchTextExact: "Bronze",
    addData: CREATED_AGE,
    addDataId: CREATED_AGE.id,
    addInput: `name: "${CREATED_AGE.name}"`,
    updateId: UPDATED_JURA_AGE.id,
    updateData: UPDATED_JURA_AGE,
    updateInput: `name: "${UPDATED_JURA_AGE.name}"`,
    deleteId: UPDATED_JURA_AGE.id,
    deleteData: UPDATED_JURA_AGE,
    deletedListData: [BRONZE_AGE, CREATED_AGE, IRON_AGE, STONE_AGE],
}, { only: false })

epochPropertyTest.run()


