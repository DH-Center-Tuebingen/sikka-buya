const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')
const PropertyTest = require('../src/property-test')
const { COINMARK_GQL_BODY, A, E, U, PI, TALER, EURO, UPDATE_EURO, NEW } = require('../mockdata/coinmark.mock')



new PropertyTest("coinMark", {
    database: "coin_marks",
    GQL_BODY: COINMARK_GQL_BODY,
    listData: [A, E, TALER, U, PI, EURO],
    getData: E,
    getDataId: E.id,
    searchData: [TALER, E],
    searchText: "e",
    searchTextExact: "ê",
    addData: NEW,
    addInput: `name: "${NEW.name}"`,
    updateInput: `name: "${UPDATE_EURO.name}"`,
    updateData: UPDATE_EURO,
    deleteData: TALER,
}).run()
