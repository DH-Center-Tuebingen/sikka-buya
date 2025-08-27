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
    TURNER_UPDATED,
    TURNER_UPDATED_INPUT,
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
    database: "person",
    GQL_BODY: PERSON_GQL_BODY,
    listData: list,
    getData: UDERZO,
    getDataId: UDERZO.id,
    searchData: [HOLLANDE],
    searchText: "cois",
    searchTextExact: "François",
    addInput: MONET_INPUT,
    addData: MONET,
    updateInput: TURNER_UPDATED_INPUT,
    updateData: TURNER_UPDATED,
    deleteData: TURNER,
    async getOriginalEntry(pgpDatabase, klass, id) {
        const result = await pgpDatabase.one(`
            SELECT person.*, pc.color as color, dyn.name as dynasty_name, dyn.id as dynasty_id, r.name as role_name, r.id as role_id FROM person
            LEFT JOIN person_color pc ON pc.person = person.id
            LEFT JOIN dynasty dyn ON dyn.id = person.dynasty
            LEFT JOIN person_role r ON r.id = person.role
            WHERE person.id = $1`, [id]
        );

        return {
            id: result.id.toString(),
            name: result.name,
            shortName: result.short_name,
            role: {
                id: result.role_id.toString(),
                name: result.role_name
            },
            dynasty: {
                id: result.dynasty_id.toString(),
                name: result.dynasty_name
            },
            color: result.color
        };
    },
    async afterDelete(pgpDatabase, klass, originalEntry) {
        await pgpDatabase.tx(async t => {

            const insert= {
                id: originalEntry.id,
                name: originalEntry.name,
                shortName: originalEntry.shortName,
                role: originalEntry.role?.id,
                dynasty: originalEntry.dynasty?.id
            }

            await t.none('INSERT INTO person(id, name, short_name, role, dynasty) VALUES($[id], $[name], $[shortName], $[role], $[dynasty])', insert);
            await t.none('INSERT INTO person_color(person, color) VALUES($[person], $[color])', {
                person: originalEntry.id,
                color: originalEntry.color
            });
        });
    },
    async afterUpdate(pgpDatabase, klass, originalEntry) {
        await pgpDatabase.tx(async t => {
            const update = {
                id: originalEntry.id,
                name: originalEntry.name,
                shortName: originalEntry.shortName,
                role: originalEntry.role?.id,
                dynasty: originalEntry.dynasty?.id
            }

            await t.none('UPDATE person SET name = $[name], short_name = $[shortName], role = $[role], dynasty = $[dynasty] WHERE id = $[id]', update);
            await t.none('UPDATE person_color SET color = $[color] WHERE person = $[person]', {
                person: originalEntry.id,
                color: originalEntry.color
            });
        });
    }
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
