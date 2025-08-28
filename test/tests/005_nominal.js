const {
    NOMINAL_GQL_BODY,
    MARK,
    PESETA,
    DOLLAR,
    YEN_UPDATED,
    TALER,
    ADIE,
    YEN
} = require('../mockdata/nominal.mock')
const PropertyTest = require('../src/property-test')

const nominalPropertyTest = new PropertyTest("nominal", {
    database: "nominal",
    GQL_BODY: NOMINAL_GQL_BODY,
    listData: [MARK, PESETA, TALER, YEN, ADIE],
    getData: MARK,
    getDataId: MARK.id,
    searchData: [PESETA],
    searchText: "pes",
    searchTextExact: "Pes",
    addData: DOLLAR,
    addDataId: DOLLAR.id,
    addInput: `name: "${DOLLAR.name}"`,
    updateData: YEN_UPDATED,
    updateInput: `name: "${YEN_UPDATED.name}"`,
    deleteData: YEN,
})

nominalPropertyTest.run()

