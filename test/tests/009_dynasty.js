const {
    DYNASTY_GQL_BODY,
    ATLANT,
    BRIT,
    GERMAN,
    FRENCH,
    AUSTRIAN,
    BUYID,
    AUSTRIAN_UPDATED_DATA
} = require('../mockdata/dynasty.mock');
const PropertyTest = require('../src/property-test');



new PropertyTest("dynasty", {
    GQL_BODY: DYNASTY_GQL_BODY,
    listData: [ATLANT, BRIT, GERMAN, FRENCH, AUSTRIAN],
    getData: BRIT,
    getDataId: BRIT.id,
    searchData: [AUSTRIAN],
    searchText: "reich",
    searchTextExact: "Öster",
    addData: BUYID,
    addInput: `name: "${BUYID.name}"`,
    updateId: AUSTRIAN.id,
    updateData: AUSTRIAN_UPDATED_DATA,
    updateInput: `name: "${AUSTRIAN_UPDATED_DATA.name}"`,
    deleteId: BUYID.id,
    deleteData: BUYID,
    deletedListData: [ATLANT, AUSTRIAN_UPDATED_DATA, BRIT, GERMAN, FRENCH],

}).run()
