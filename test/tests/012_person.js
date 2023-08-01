const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { UDERZO,
    DUERER,
    MERKEL,
    ARIELLE,
    CHARLES_DE_GAULLE,
    ELIZABETH_II,
    MACRON,
    FISCH,
    HOLLANDE,
    BERNINI,
    WESTERWELLE,
    KOHL,
    CHIRAC,
    GAUCK,
    KARL,
    LOUIS,
    MICHELANGELO,
    SARKOZY,
    PLANKTON,
    POSEIDON,
    GOSCINNY,
    SEBASTIAN,
    WAL,
    TURNER,
    CHURCHILL,
    MONET,
    MONET_INPUT,
    MONET_UPDATED,
    MONET_UPDATED_INPUT,
    PERSON_GQL_BODY } = require('../mockdata/person.mock')
const PropertyTest = require('../src/property-test')

const list = [
    UDERZO,
    DUERER,
    MERKEL,
    ARIELLE,
    CHARLES_DE_GAULLE,
    ELIZABETH_II,
    MACRON,
    FISCH,
    HOLLANDE,
    BERNINI,
    WESTERWELLE,
    KOHL,
    CHIRAC,
    GAUCK,
    KARL,
    LOUIS,
    MICHELANGELO,
    SARKOZY,
    PLANKTON,
    POSEIDON,
    GOSCINNY,
    SEBASTIAN,
    WAL,
    TURNER,
    CHURCHILL
]

const PersonTest = new PropertyTest("person", {
    GQL_BODY: PERSON_GQL_BODY,
    listData: list,
    getData: UDERZO,
    getDataId: UDERZO.id,
    searchData: [HOLLANDE],
    searchText: "cois",
    searchTextExact: "François",
    addInput: MONET_INPUT,
    addData: MONET,
    updateId: MONET.id,
    updateInput: MONET_UPDATED_INPUT,
    updateData: MONET_UPDATED,
    deleteId: MONET.id,
    deleteData: MONET_UPDATED,
    deletedListData: list
})

PersonTest.addTest("search", function () {
    it("Search Person With Role", async function () {
        let result = await graphql(`{searchPersonsWithRole(text:"") ${PERSON_GQL_BODY}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "searchPersonsWithRole": [
                    UDERZO,
                    DUERER,
                    ELIZABETH_II,
                    BERNINI,
                    KARL,
                    LOUIS,
                    MICHELANGELO,
                    POSEIDON,
                    GOSCINNY,
                    WAL,
                    TURNER,
                ]
            }
        })
    })
})

PersonTest.run()




//     it("Unauthorized Add Rejected", async function () {
//         let promise = graphql(`mutation {
//             addPerson(data:{name:"Claude Monet", shortName: "Monet", role: 2, dynasty:2})
//           }`)
//         await expect(promise).to.be.rejectedWith(["401"])
//     })

//     it("Add", async function () {
//         let promise = graphql(`mutation {
//             addPerson(data:{name:"Claude Monet", shortName: "Monet", role: 2, dynasty:2})
//           }`, {}, User1.token)
//         await expect(promise).to.be.fulfilled
//     })

//     it("Unauthorized Update Rejected", async function () {
//         let promise = graphql(`mutation{updatePerson(data:{id:26, name: "changed", role: 1, dynasty: 1, color:"#ff0000"})}`)
//         await expect(promise).to.be.rejectedWith(["401"])
//     })

//     it("Update", async function () {
//         let promise = graphql(`mutation{updatePerson(data:{id:26, name: "changed", role: 1, dynasty: 1, color:"#00ff00"})}`, {}, User1.token)
//         await expect(promise).to.be.fulfilled
//     })

//     //TODO CHECK IF UPDATED SUCCESSFULLY

//     it("Unauthorized Delete Rejected", async function () {
//         let promise = graphql(`mutation{deletePerson(id:26)}`)
//         await expect(promise).to.be.rejectedWith(["404"])
//     })

//     it("Delete", async function () {
//         let promise = graphql(`mutation{deletePerson(id:26)}`, {}, User1.token)
//         await expect(promise).to.be.fulfilled
//     })

//     it("Table is the same as when started", async function () {
//         let result = await graphql(`{person ${body}}`)
//         expect(result.data).to.deep.equal(startData)
//     })

// })
