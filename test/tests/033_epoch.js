const { EPOCH_GQL_BODY, BRONZE_AGE, IRON_AGE, STONE_AGE, CREATED_AGE, JURA_AGE, UPDATED_JURA_AGE } = require('../mockdata/epoch.mock')
const PropertyTest = require('../src/property-test')

const epochPropertyTest = new PropertyTest("epoch", {
    database: "epoch",
    GQL_BODY: EPOCH_GQL_BODY,
    listData: [BRONZE_AGE, IRON_AGE, JURA_AGE, STONE_AGE],
    getData: BRONZE_AGE,
    getDataId: BRONZE_AGE.id,
    searchData: [BRONZE_AGE],
    searchText: "bronze",
    searchTextExact: "Bronze",
    addData: CREATED_AGE,
    addDataId: CREATED_AGE.id,
    addInput: `name: "${CREATED_AGE.name}"`,
    updateData: UPDATED_JURA_AGE,
    updateInput: `name: "${UPDATED_JURA_AGE.name}"`,
    deleteData: JURA_AGE,
    async getOriginalEntry(pgpDatabase, klass, id) {
        return pgpDatabase.one(`SELECT id, name FROM epoch WHERE id = $1`, [id])

    }

    //// The timestamps are currently not utilised.
    // async afterUpdate(pgpDatabase, klass, originalEntry) {
    //     console.log("AFTER UPDATE", originalEntry)
    //     const isoTimeCreated = originalEntry.created_at.toISOString()
    //     const isoTimeUpdated = originalEntry.updated_at.toISOString()
    //     pgpDatabase.none(`UPDATE epoch SET name = $1, created_at = $2, updated_at = $3 WHERE id = $4`, [originalEntry.name, isoTimeCreated, isoTimeUpdated, originalEntry.id])
    // },
    // async afterDelete(pgpDatabase, klass, originalEntry) {
    //     console.log("AFTER UPDATE", originalEntry)
    //     const isoTimeCreated = originalEntry.created_at.toISOString()
    //     const isoTimeUpdated = originalEntry.updated_at.toISOString()
    //     pgpDatabase.none(`INSERT INTO epoch (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4)`, [originalEntry.id, originalEntry.name, isoTimeCreated, isoTimeUpdated])
    // }
}, { only: false })

epochPropertyTest.run()


