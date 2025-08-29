const {
    ATLANTIS_REGION,
    CONSTANTINOPLE_REGION,
    GERMANY_REGION,
    PARIS_REGION,
    CONSTANTINOPLE_REGION_UPDATED_INPUT,
    CONSTANTINOPLE_REGION_UPDATED,
    MINT_REGION_GQL_BODY,
    TEST_MINT_REGION_DATA,
    TEST_MINT_REGION_INPUT
} = require('../mockdata/mintregion.mock');
const PropertyTest = require('../src/property-test');

new PropertyTest("mintRegion", {
    database: "mint_region",
    GQL_BODY: MINT_REGION_GQL_BODY,

    listData: [
        ATLANTIS_REGION,
        CONSTANTINOPLE_REGION,
        GERMANY_REGION,
        PARIS_REGION,
    ],
    getData: GERMANY_REGION,
    getDataId: GERMANY_REGION.id,
    searchData: [ATLANTIS_REGION],
    searchText: "atla",
    searchTextExact: "Āt",
    addData: TEST_MINT_REGION_DATA,
    addInput: TEST_MINT_REGION_INPUT,
    updateData: CONSTANTINOPLE_REGION_UPDATED,
    updateInput: CONSTANTINOPLE_REGION_UPDATED_INPUT,
    deleteData: CONSTANTINOPLE_REGION,
    async getOriginalEntry(pgpDatabase, klass, id) {
        const result = await pgpDatabase.one(`SELECT *, ST_AsGeoJSON(location)::json AS json_location FROM mint_region WHERE id = $[id]`, { id });
        const mintRegion = {
            id: result.id.toString(),
            name: result.name,
            uncertain: result.uncertain,
            location: result.json_location
        };
        return mintRegion;
    },
    async afterUpdate(pgpDatabase, klass, originalEntry) {
        pgpDatabase.none(`UPDATE mint_region SET name = $[name], uncertain = $[uncertain], location = ST_GeomFromGeoJSON($[location]) WHERE id = $[id]`, {
            id: originalEntry.id,
            name: originalEntry.name,
            uncertain: originalEntry.uncertain,
            location: JSON.stringify(originalEntry.location)
        });
    },
    async afterDelete(pgpDatabase, klass, originalEntry) {
        pgpDatabase.none(`INSERT INTO mint_region(id, name, uncertain, location) VALUES($[id], $[name], $[uncertain], ST_GeomFromGeoJSON($[location]))`, {
            id: originalEntry.id,
            name: originalEntry.name,
            uncertain: originalEntry.uncertain,
            location: JSON.stringify(originalEntry.location)
        });
    },
});