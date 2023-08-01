const {
    NOMINAL_GQL_BODY,
    MARK,
    ZLOTY,
    DOLLAR,
    YEN_UPDATED,
    TALER,
    ADIE,
    YEN
} = require('../mockdata/nominal.mock')
const PropertyTest = require('../src/property-test')

const nominalPropertyTest = new PropertyTest("nominal", {
    GQL_BODY: NOMINAL_GQL_BODY,
    listData: [MARK, TALER, ZLOTY, YEN, ADIE],
    getData: MARK,
    getDataId: MARK.id,
    searchData: [ZLOTY],
    searchText: "zl",
    searchTextExact: "Zł",
    addData: DOLLAR,
    addDataId: DOLLAR.id,
    addInput: `name: "${DOLLAR.name}"`,
    updateId: YEN.id,
    updateData: YEN_UPDATED,
    updateInput: `name: "${YEN_UPDATED.name}"`,
    deleteId: DOLLAR.id,
    deleteData: DOLLAR,
    deletedListData: [MARK, TALER, ZLOTY, YEN_UPDATED, ADIE],
})

nominalPropertyTest.run()




// describe(`Nominal Queries`, function () {

//     describe("Access", function () {
//         it(`List`, async function () {
//             const queryName = "nominal"
//             let result = await graphql(`{${queryName} ${NOMINAL_GQL_BODY}}`)
//             console.log(result)
//             expect(result.data).to.deep.equal({
//                 data: {
//                     [queryName]: NOMINAL_START_DATA
//                 }
//             })
//         })

//         it("Get", async function () {

//             const queryName = "getNominal"
//             let result = await graphql(`
//         {
//             ${queryName}(id:2) ${NOMINAL_GQL_BODY}
//         }`)
//             expect(result.data).to.deep.equal({
//                 data: {
//                     [queryName]: MARK
//                 }
//             })
//         })
//     })

//     describe("Search", function () {

//         it("Search with regular characters", async function () {
//             const queryName = "searchNominal"

//             let result = await graphql(`
//             {${queryName}(text: "zl") ${NOMINAL_GQL_BODY}}`)

//             expect(result.data).to.deep.equal({
//                 "data": {
//                     [queryName]: [ZLOTY]
//                 }
//             })
//         })

//         it("Search with exact characters", async function () {
//             const queryName = "searchNominal"

//             let result = await graphql(`
//             {${queryName}(text: "Zł") ${NOMINAL_GQL_BODY}}`)

//             expect(result.data).to.deep.equal({
//                 "data": {
//                     [queryName]: [ZLOTY]
//                 }
//             })
//         })

//     })

//     describe("Add", function () {

//         it("Unauthorized Add Rejected", async function () {
//             let promise = graphql(`mutation{addNominal(${EURO.name})}`)
//             await expect(promise).to.be.rejectedWith(["401"])
//         })

//         it("Add", async function () {
//             let promise = graphql(`mutation{addNominal(${EURO.name})}`, {}, User1.token)
//             await expect(promise).to.be.fulfilled
//         })

//         it("Item was added", async function () {
//             let result = await graphql(`{nominal ${NOMINAL_GQL_BODY}}`)
//             expect(result.data.nominal).to.include(EURO)
//         })

//         it("Added item is correct", async function () {
//             const queryName = "getNominal"
//             let result = await graphql(`{ ${queryName} ${NOMINAL_GQL_BODY}}`)
//             expect(result.data[queryName]).to.deep.equal(EURO)
//         })

//     })

//     // describe("Update", function () {

//     //     it("Unauthorized Update Rejected", async function () {
//     //         let promise = graphql(`mutation{updateNominal(id:6, name: "changed")}`)
//     //         await expect(promise).to.be.rejectedWith(["401"])
//     //     })

//     //     it("Update", async function () {
//     //         let promise = graphql(`mutation{updateNominal(id:6, name: "changed")}`, {}, User1.token)
//     //         await expect(promise).to.be.fulfilled
//     //     })

//     //     it("Item was added", async function () {
//     //         let promise = graphql(`mutation{updateNominal(id:6, name: "changed")}`, {}, User1.token)
//     //         await expect(promise).to.be.fulfilled
//     //     })

//     // })


//     // it("Unauthorized Delete Rejected", async function () {
//     //     let promise = graphql(`mutation{deleteNominal(id:5)}`)
//     //     await expect(promise).to.be.rejectedWith(["404"])
//     // })

//     // it("Delete", async function () {
//     //     let promise = graphql(`mutation{deleteNominal(id:5)}`, {}, User1.token)
//     //     await expect(promise).to.be.fulfilled
//     // })

//     // it("Table is the same as when started", async function () {
//     //     let result = await graphql(`{nominal ${NOMINAL_GQL_BODY}}`)
//     //     expect(result.data).to.deep.equal(startData)
//     // })

// })
