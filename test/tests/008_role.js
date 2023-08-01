const {
    ROLE_GQL_BODY,
    ROLE_ADD_DATA,
    CUTTER,
    DAULA,
    CALIPH,
    ROLE_ADD_INPUT,
    DAULA_UPDATE_DATA
} = require('../mockdata/role.mock');
const PropertyTest = require('../src/property-test');

new PropertyTest("role", {
    GQL_BODY: ROLE_GQL_BODY,
    listData: [CALIPH, CUTTER, DAULA],
    getData: CUTTER,
    getDataId: CUTTER.id,
    searchData: [DAULA],
    searchText: "da",
    searchTextExact: "Dā",
    addData: ROLE_ADD_DATA,
    addInput: ROLE_ADD_INPUT,
    updateId: DAULA.id,
    updateData: DAULA_UPDATE_DATA,
    updateInput: `name: "${DAULA_UPDATE_DATA.name}"`,
    deleteId: ROLE_ADD_DATA.id,
    deleteData: ROLE_ADD_DATA,
    deletedListData: [CALIPH, CUTTER, DAULA_UPDATE_DATA],
}).run()


// const { expect } = require('chai')
// const { graphql } = require('../helpers/graphql')
// const { User1 } = require('../mockdata/users')

// const startData = {
//     "data": {
//         "role": [
//             {
//                 "name": "caliph",
//                 "id": "1"
//             },
//             {
//                 "name": "cutter",
//                 "id": "2"
//             },
//             {
//                 "id": "3",
//                 "name": "Dāula"
//             }
//         ]
//     }
// }

// const body = `{id,name}`

// describe(`Role Queries`, function () {
//     it(`List`, async function () {
//         let result = await graphql(`{role ${body}}`)

//         expect(result.data).to.deep.equal(startData)
//     })

//     it("Get", async function () {
//         let result = await graphql(`
//         {
//             getRole(id:2) ${body}
//         }
// `)

//         expect(result.data).to.deep.equal({
//             "data": {
//                 "getRole": {
//                     "id": "2",
//                     "name": "cutter"
//                 }
//             }
//         })
//     })

//     it("Search with regular characters", async function () {
//         let result = await graphql(`
//             {searchRole(text: "da") ${body}}`)

//         expect(result.data).to.deep.equal({
//             "data": {
//                 "searchRole": [
//                     {
//                         "id": "3",
//                         "name": 'Dāula'
//                     }
//                 ]
//             }
//         })
//     })

//     it("Search with exact characters", async function () {
//         let result = await graphql(`
//             {searchRole(text: "Dā") ${body}}`)

//         expect(result.data).to.deep.equal({
//             "data": {
//                 "searchRole": [
//                     {
//                         "id": "3",
//                         "name": 'Dāula'
//                     }
//                 ]
//             }
//         })
//     })

//     it("Unauthorized Add Rejected", async function () {
//         let promise = graphql(`mutation{addRole(name:"test")}`)
//         await expect(promise).to.be.rejectedWith(["401"])
//     })

//     it("Add", async function () {
//         let promise = graphql(`mutation{addRole(name:"test")}`, {}, User1.token)
//         await expect(promise).to.be.fulfilled
//     })


//     it("Unauthorized Update Rejected", async function () {
//         let promise = graphql(`mutation{updateRole(id:5, name: "changed")}`)
//         await expect(promise).to.be.rejectedWith(["401"])
//     })

//     it("Update", async function () {
//         let promise = graphql(`mutation{updateRole(id:5, name: "changed")}`, {}, User1.token)
//         await expect(promise).to.be.fulfilled
//     })

//     it("Unauthorized Delete Rejected", async function () {
//         let promise = graphql(`mutation{deleteRole(id:4)}`)
//         await expect(promise).to.be.rejectedWith(["404"])
//     })

//     it("Delete", async function () {
//         let promise = graphql(`mutation{deleteRole(id:4)}`, {}, User1.token)
//         await expect(promise).to.be.fulfilled
//     })

//     it("Table is the same as when started", async function () {
//         let result = await graphql(`{role${body}}`)
//         expect(result.data).to.deep.equal(startData)
//     })


// })
