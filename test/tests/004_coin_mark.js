const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')
const PropertyTest = require('../src/property-test')
const { COINMARK_GQL_BODY, A, E, U, PI, EURO } = require('../mockdata/coinmark.mock')



new PropertyTest("coinMark", {
    GQL_BODY: COINMARK_GQL_BODY,
    listData: [A, E, U, PI, EURO],
    getData: E,
    getDataId: E.id,
    searchData: [E],
    searchText: "e",
    searchTextExact: "ê",
    addData: { id: "6", name: "test" },
    addInput: `name: "test"`,
    updateId: 6,
    updateInput: `name: "changed"`,
    updateData: { id: "6", name: "changed" },
    deleteId: 6,
    deleteData: { id: "6", name: "changed" },
    deletedListData: [A, E, U, PI, EURO],
}).run()
