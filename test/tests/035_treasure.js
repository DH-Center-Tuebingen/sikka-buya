const { graphql } = require('../helpers/graphql')
const chai = require('chai')
const { User1, SuperUser } = require('../mockdata/users')
const {
    CORUNA_DATA,
    LONDON_DATA,
    LODZ_INPUT,
    LODZ_DATA,
    START_DATA,
    TREASURE_GQL_BODY,
    UPDATED_LONDON_DATA_INPUT,
    UPDATED_LONDON_DATA,
} = require('../mockdata/treasure.mock')

const {
    TREASURE_ITEM_GQL_BODY, GERMAN_TREASURE_ITEM, GERMAN_TWO_TREASURE_ITEM, ALESIA_TREASURE_ITEM, ATLANTIS_TREASURE_ITEM, NEU_BERLIN_TREASURE_ITEM, FRENCH_TREASURE_ITEM
} = require('../mockdata/treasure-item.mock')
const { default: axios } = require('axios')
const { setupTestDatabase, resetTestDatabase } = require('../tasks/setup')

const expect = chai.expect


describe(`Treasure Queries`, function () {

    this.beforeEach(async function () {
        await User1.login()
    })


    it(`List`, async function () {
        const treasure = `{treasure ${TREASURE_GQL_BODY}}`
        let result = await graphql(treasure)

        expect(result.data).to.deep.equal({
            "data": {
                "treasure": [
                    CORUNA_DATA,
                    LONDON_DATA
                ]
            }
        })
    })

    it("Get", async function () {
        const queryName = "getTreasure"
        let result = await graphql(`{${queryName}(id:2)${TREASURE_GQL_BODY}}`)

        expect(result.data).to.deep.equal({
            "data": {
                [queryName]: CORUNA_DATA
            }
        })
    })

    it("Search with regular characters", async function () {
        const queryName = "searchTreasure"

        let result = await graphql(`
            {${queryName}(text: "ña") ${TREASURE_GQL_BODY}}`)

        expect(result.data).to.deep.equal({
            "data": {
                [queryName]: [
                    CORUNA_DATA
                ]
            }
        })
    })

    it("Search with exact characters", async function () {
        const queryName = "searchTreasure"

        let result = await graphql(`
            {${queryName}(text: "La Coruña") ${TREASURE_GQL_BODY}}`)

        expect(result.data).to.deep.equal({
            "data": {
                [queryName]: [
                    CORUNA_DATA
                ]
            }
        })
    })

    it("Unauthorized Add Rejected", async function () {
        const queryName = "addTreasure"

        let promise = graphql(`
            mutation{${queryName}(data: ${LODZ_INPUT})})
            `)

        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Add", async function () {
        const queryName = "addTreasure"

        const query = `
        mutation{${queryName}(data: ${LODZ_INPUT})}
        `
        let promise = graphql(query, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })

    it("Added correctly", async function () {
        const queryName = "treasure"

        let result = await graphql(`{${queryName} ${TREASURE_GQL_BODY}}`)
        expect(result.data).to.deep.equal({
            "data": {
                [queryName]: [
                    START_DATA[0],
                    LODZ_DATA,
                    START_DATA[1]
                ]
            }
        })
    })

    describe("Update", function () {

        it("Unauthorized Update Rejected", async function () {
            const queryName = "updateTreasure"

            const query = `mutation{
                ${queryName}(id: 1,data:
                    ${UPDATED_LONDON_DATA_INPUT}
                )
            }`
            let promise = graphql(query)
            await expect(promise).to.be.rejectedWith(["401"])
        })

        it("Update", async function () {
            const queryName = "updateTreasure"
            const query = `mutation{${queryName}(id: 1, data: ${UPDATED_LONDON_DATA_INPUT})}`
            let promise = graphql(query, {}, User1.token)
            await expect(promise).to.be.fulfilled
        })

        it("Updated correctly", async function () {
            const queryName = "treasure"
            let result = await graphql(`{${queryName} ${TREASURE_GQL_BODY}}`)
            expect(result.data).to.deep.equal(
                {
                    "data": {
                        [queryName]: [
                            UPDATED_LONDON_DATA,
                            START_DATA[0],
                            LODZ_DATA
                        ]
                    }
                }
            )
        })
    })

    describe("Delete", function () {
        it("Unauthorized Delete Rejected", async function () {
            const queryName = "deleteTreasure"
            let promise = graphql(`mutation{${queryName} (id:3)}`)
            await expect(promise).to.be.rejectedWith(["401"])
        })

        it("Delete", async function () {
            const queryName = "deleteTreasure"
            let promise = graphql(`mutation{${queryName} (id:3)}`, {}, User1.token)
            await expect(promise).to.be.fulfilled
        })

        it("Deleted list is correct", async function () {
            const result = await graphql(`{treasure ${TREASURE_GQL_BODY}}`)
            expect(result.data).to.deep.equal({
                "data": {
                    "treasure": [
                        UPDATED_LONDON_DATA,
                        START_DATA[0]
                    ]
                }
            })
        })

        it("Treasure items are deleted correctly", async function () {
            const queryName = "treasureItem"
            let result = await graphql(`{${queryName} ${TREASURE_ITEM_GQL_BODY}}`)
            expect(result.data).to.deep.equal(
                {
                    "data": {
                        [queryName]: [
                            GERMAN_TWO_TREASURE_ITEM,
                            ATLANTIS_TREASURE_ITEM,
                            NEU_BERLIN_TREASURE_ITEM,
                        ]
                    }
                }
            )
        })
    })




})