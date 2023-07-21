
const PropertyTest = require('../src/property-test');

//\\ material data can be found at [[../data/0006_material.sql]]

const {
    MATERIAL_GQL_BODY,
    PLATIN,
    SILVER,
    TITAN,
    TITAN_UPDATED,
    GOLD,
    COPPER,
    PERLMUTT
} = require('../mockdata/material.mock');


new PropertyTest("material", {
    GQL_BODY: MATERIAL_GQL_BODY,
    listData: [
        GOLD,
        COPPER,
        PERLMUTT,
        SILVER,
        TITAN
    ],
    getData: SILVER,
    getDataId: SILVER.id,
    searchData: [GOLD],
    searchText: "go",
    searchTextExact: "Gø",
    addData: PLATIN,
    addInput: `name: "${PLATIN.name}", color: "${PLATIN.color}"`,
    updateId: TITAN.id,
    updateData: TITAN_UPDATED,
    updateInput: `name: "${TITAN_UPDATED.name}", color: "${TITAN_UPDATED.color}"`,
    deleteId: PLATIN.id,
    deleteData: PLATIN,
    deletedListData: [GOLD, COPPER, PERLMUTT, SILVER, TITAN_UPDATED],
}).run()