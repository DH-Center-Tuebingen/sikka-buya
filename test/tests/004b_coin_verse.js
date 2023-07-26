const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')
const PropertyTest = require('../src/property-test')
const { ARABIC,
    COINVERSE_GQL_BODY,
    KORAN30,
    KORAN9,
    SWEDISH,
    TEST, } = require('../mockdata/coinverse.mock')

new PropertyTest("coinVerse", {
    GQL_BODY: COINVERSE_GQL_BODY,
    listData: [KORAN30, KORAN9, SWEDISH, ARABIC],
    getData: ARABIC,
    getDataId: ARABIC.id,
    searchData: [SWEDISH],
    searchText: "sma",
    searchTextExact: "små",
    addData: TEST,
    addInput: `name: "test"`,
    updateId: 4,
    updateInput: `name: "changed"`,
    updateData: { id: "4", name: "changed" },
    deleteId: 4,
    deleteData: { id: "4", name: "changed" },
    deletedListData: [KORAN30, KORAN9, TEST, ARABIC],
}).run()


