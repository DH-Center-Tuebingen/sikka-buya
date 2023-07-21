const { TITLE_GQL_BODY, DR, KOENIG, KOENIGIN, MONSIEUR, PROF, TIER, SIR, SIR_UPDATED, LADY } = require('../mockdata/title.mock');
const PropertyTest = require('../src/property-test');

//\\ see [[../data/0005_titles.sql]]


new PropertyTest("title", {
    GQL_BODY: TITLE_GQL_BODY,
    listData: [DR, KOENIG, KOENIGIN, MONSIEUR, PROF, SIR, TIER],
    getData: MONSIEUR,
    getDataId: MONSIEUR.id,
    searchData: [KOENIG, KOENIGIN],
    searchText: "ko",
    searchTextExact: "Kö",
    addData: LADY,
    addInput: `name: "${LADY.name}"`,
    updateId: SIR.id,
    updateData: SIR_UPDATED,
    updateInput: `name: "${SIR_UPDATED.name}"`,
    deleteId: LADY.id,
    deleteData: LADY,
    deletedListData: [DR, KOENIG, KOENIGIN, MONSIEUR, PROF, SIR_UPDATED, TIER],
}).run()

