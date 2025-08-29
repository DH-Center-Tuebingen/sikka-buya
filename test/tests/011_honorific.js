const PropertyTest = require('../src/property-test')
const { HONORIFICS_GQL_BODY, BULLDOZER, PEAR, FRANCAIS, GENERAL, MERMAID, OF_GERMANY, CREATURE_OF_THE_SEA, THE_BALD, THE_BALD_UPDATED, THE_INCORRECT, THE_ADDED, THE_GREAT, BLACK_GIANT } = require('../mockdata/honorific.mock')

new PropertyTest("honorific", {
    database: "honorific",
    GQL_BODY: HONORIFICS_GQL_BODY,
    listData: [BULLDOZER, THE_GREAT, THE_BALD, BLACK_GIANT, PEAR, THE_INCORRECT, FRANCAIS, GENERAL, MERMAID, OF_GERMANY, CREATURE_OF_THE_SEA],
    getData: GENERAL,
    getDataId: GENERAL.id,
    searchText: "cais",
    searchTextExact: "le Français",
    searchData: [FRANCAIS],
    addInput: `name: "${THE_ADDED.name}"`,
    addData: THE_ADDED,
    updateInput: `name: "${THE_BALD_UPDATED.name}"`,
    updateData: THE_BALD_UPDATED,
    deleteData: THE_BALD
}).run()