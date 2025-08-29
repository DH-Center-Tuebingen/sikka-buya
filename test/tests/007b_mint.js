//\\ as defined in [[../data/0001b_mints.sql]]

const { graphql } = require('../helpers/graphql');
const { expect } = require('chai')

const {
    MINT_GQL_BODY,
    BERLIN,
    PARIS,
    ATLANTIS,
    TEST_MINT_INPUT,
    TEST_MINT_DATA,
    ISTANBUL_UPDATED,
    ISTANBUL_UPDATED_INPUT,
    ISTANBUL
} = require('../mockdata/mint.mock');
const { SuperUser } = require('../mockdata/users');
const PropertyTest = require('../src/property-test');

const resultToMint = (result) => {
    const mint = {
        id: result.id.toString(),
        name: result.name,
        location: result.location == null ? null : JSON.parse(result.location),
        uncertain: result.uncertain,
        uncertainArea: result.uncertain_area == null ? null : JSON.parse(result.uncertain_area),
        province: {
            id: result.province_id.toString(),
            name: result.province_name
        }
    }

    return mint
}

let mintTest = new PropertyTest("mint", {
    database: "mint",
    GQL_BODY: MINT_GQL_BODY,
    listData: [ATLANTIS, BERLIN, ISTANBUL, PARIS],
    getData: ATLANTIS,
    getDataId: ATLANTIS.id,
    searchData: [ATLANTIS],
    searchText: "atla",
    searchTextExact: "Ǎt",
    addData: TEST_MINT_DATA,
    addInput: TEST_MINT_INPUT,
    updateData: ISTANBUL_UPDATED,
    updateInput: ISTANBUL_UPDATED_INPUT,
    deleteData: ISTANBUL,
    async getOriginalEntry(pgpDatabase, klass, id) {
        const result = await pgpDatabase.one(`
            SELECT mint.*, 
                ST_AsGeoJSON(location)          AS location,
                ST_AsGeoJSON(uncertain_area)    AS uncertain_area,
                p.id                            AS province_id,
                p.name                          AS province_name
            FROM mint
            LEFT JOIN province p ON mint.province = p.id
            WHERE mint.id=${id}`)

        return resultToMint(result)
    },
    async afterUpdate(pgpDatabase, klass, originalEntry){        
        await pgpDatabase.none(`
            UPDATE mint SET 
                name = $[name],
                location = ${originalEntry.location ? "ST_GeomFromGeoJSON($[location])" : null} ,
                uncertain = $[uncertain],
                uncertain_area = ${originalEntry.uncertainArea ? "ST_GeomFromGeoJSON($[uncertainArea])" : null} ,
                province = $[provinceId]
            WHERE id = $[id]
            `, {...originalEntry, provinceId: originalEntry.province?.id})
    },
    async afterDelete(pgpDatabase, klass, originalEntry) {
        await pgpDatabase.none(`
            INSERT INTO mint (
                id,
                name,
                location,
                uncertain,
                uncertain_area,
                province
                )  
            VALUES
            (
                $[id],
                $[name],
                ${originalEntry.location ? "ST_GeomFromGeoJSON($[location])" : null} ,
                $[uncertain],
                ${originalEntry.uncertainArea ? "ST_GeomFromGeoJSON($[uncertainArea])" : null} ,
                $[provinceId]
            )`,
            {...originalEntry, provinceId: originalEntry.province?.id}
        )
    },
})

// mintTest.addTest("delete", function(){
//     it("Deleting mint with reference is rejected", async function(){
//         let promise = graphql(`mutation { deleteMint(id: ${PARIS.id}) }`, {}, SuperUser.token)
//         return expect(promise).to.be.rejected;
//     })
// })


mintTest.run()

