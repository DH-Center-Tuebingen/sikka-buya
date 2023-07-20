

const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')



describe(`Mint Queries`, function () {

    this.beforeEach(async function () {
        await User1.login()
    })

    it(`List`, async function () {
        let result = await graphql(`{mint ${body}}`)
        expect(result.data).to.deep.equal({
            "data": {
                "mint": START_DATA
            }
        })
    })

    it("Get", async function () {
        let result = await graphql(`{getMint(id:3)${body}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "getMint": ATLANTIS
            }
        })
    })

    it("Search with regular characters", async function () {
        let result = await graphql(`
            {searchMint(text: "at") ${body}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "searchMint": [
                    ATLANTIS
                ]
            }
        })
    })

    it("Search with exact characters", async function () {
        let result = await graphql(`
            {searchMint(text: "Ǎt") ${body}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "searchMint": [
                    ATLANTIS
                ]
            }
        })
    })

    it("Unauthorized Add Rejected", async function () {
        let promise = graphql(`mutation{addMint(data: ${TEST_DATA_BODY})}`)
        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Add", async function () {
        let promise = graphql(`mutation{addMint(data: ${TEST_DATA_BODY})}`, {}, User1.token)
        await expect(promise).to.be.fulfilled

    })

    it("Added correctly", async function () {
        let result = await graphql(`{mint ${body}}`)
        expect(result.data).to.deep.equal({
            "data": {
                "mint": [
                    ...START_DATA,
                    TEST_DATA
                ]
            }
        })
    })


    it("Unauthorized Update Rejected", async function () {
        const query = `mutation{
            updateMint(id: 5,data:
                ${UPDATE_DATA_BODY}
            )
        }`
        let promise = graphql(query)
        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Update", async function () {
        let promise = graphql(`mutation{updateMint(id: 5, data: ${UPDATE_DATA_BODY})}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })

    it("Updated correctly", async function () {

        let result = await graphql(`{mint ${body}}`)
        expect(result.data).to.deep.equal(
            {
                "data": {
                    "mint": [
                        ...START_DATA,
                        TEST_DATA
                    ]
                }
            }
        )
    })

    it("Unauthorized Delete Rejected", async function () {
        let promise = graphql(`mutation{deleteMint(id:4)}`)
        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Delete", async function () {
        let promise = graphql(`mutation{deleteMint(id:4)}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })

    it("Table is the same as when started", async function () {
        let result = await graphql(`{mint${body}}`)
        expect(result.data).to.deep.equal({
            "data": {
                "mint": START_DATA
            }
        })
    })

})
