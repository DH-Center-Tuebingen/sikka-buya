
const { graphql } = require('../../../test/helpers/graphql')
const { SuperUser } = require('../../../mockdata/users')
const {
    CORUNA_DATA,
    LODZ_INPUT,
    LODZ_DATA,
    START_DATA,
    TREASURE_GQL_BODY,
    getTreasureGqlBodyWithoutItems,
    UPDATED_LONDON_DATA_INPUT,
    UPDATED_LONDON_DATA,
} = require('../../../mockdata/treasure.mock')

const OTTOMAN_TREASURE_ITEM_GQL_BODY = `{
    person
    issuingState
    historicalRegion

    singleFind
    reliableAttribution
    completeHoard
    ottomanPredominance

    authenticity
    circumstances
    subclassification

    yearOfLoss
    yearOfMint
}`
const OTTOMAN_TREASURE_GQL_BODY = getTreasureGqlBodyWithoutItems(`items ${OTTOMAN_TREASURE_ITEM_GQL_BODY}`)

describe(`Ottoman Treasure Queries`, function () {

    describe("Add", function () {

        it("Unauthorized Add Rejected", async function () {
            const queryName = "addTreasure"

            let promise = graphql(`
            mutation{${queryName}(data: ${LODZ_INPUT})}
            `)

            await expect(promise).to.be.rejectedWith(["401"])
        })

        it("Add", async function () {
            const queryName = "addTreasure"

            const query = `
        mutation{${queryName}(data: ${LODZ_INPUT})}
        `
            let promise = graphql(query, {}, SuperUser.token)
            await expect(promise).to.be.fulfilled
        })

        it("Added correctly", async function () {
            const queryName = "treasure"

            let result = await graphql(`{${queryName} ${OTTOMAN_TREASURE_GQL_BODY}}`)
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
    })
})