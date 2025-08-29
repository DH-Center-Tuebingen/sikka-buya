
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
    database: "material",
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
    // ==== UPDATE =====
    updateData: TITAN_UPDATED,
    updateInput: `name: "${TITAN_UPDATED.name}", color: "${TITAN_UPDATED.color}"`,
    async afterUpdate(pgpDatabase, klass, originalEntry) {
        await pgpDatabase.tx(async t => {
            await t.none(`UPDATE material SET name = $[name] WHERE id = $[id]`, originalEntry)
            await t.none(`UPDATE material_color SET color = $[color] WHERE material = $[id]`, originalEntry)
        })
    },
    // ==== DELETE =====
    deleteData: TITAN,
    afterDelete: async (pgpDatabase, klass, originalEntry) => {
        await pgpDatabase.tx(async t => {
            await t.none(`INSERT INTO material (id, name) VALUES ($[id], $[name])`, originalEntry)
            await t.none(`INSERT INTO material_color (material, color) VALUES ($[id], $[color])`, originalEntry)
        })
    },
    async getOriginalEntry(pgpDatabase, klass, id) {
        let material = await pgpDatabase.one(`
            SELECT material.id as id, material.name as name, mc.color as color FROM material
            RIGHT JOIN material_color mc ON material.id = mc.material
            WHERE id=$1`, [id])
        // GraphQL returns the id as string.
        material.id = material.id.toString();
        return material
    },
}).run()