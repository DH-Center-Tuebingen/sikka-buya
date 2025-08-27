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
    database: "dynasty",
    GQL_BODY: DYNASTY_GQL_BODY,
    listData: [ATLANT, BRIT, GERMAN, FRENCH, AUSTRIAN],
    getData: BRIT,
    getDataId: BRIT.id,
    searchData: [AUSTRIAN],
    searchText: "reich",
    searchTextExact: "Öster",
    addData: BUYID,
    addInput: `name: "${BUYID.name}"`,
    updateData: AUSTRIAN_UPDATED_DATA,
    updateInput: `name: "${AUSTRIAN_UPDATED_DATA.name}"`,
    deleteData: AUSTRIAN,
}).run()
