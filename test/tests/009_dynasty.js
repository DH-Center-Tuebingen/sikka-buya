
const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')




describe(`Dynasty Queries`, function () {
    it(`List`, async function () {
        let result = await graphql(`{dynasty ${body}}`)

        expect(result.data).to.deep.equal(startData)
    })

    it("Get", async function () {
        let result = await graphql(`
        {
            getDynasty(id:2) ${body}
        }
`)

        expect(result.data).to.deep.equal({
            "data": {
                "getDynasty": {
                    "id": "2",
                    "name": "Franzosen"
                }
            }
        })
    })

    it("Search with regular characters", async function () {
        let result = await graphql(`
            {searchDynasty(text: "ös") ${body}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "searchDynasty": [
                    {
                        "id": "2",
                        "name": "Franzosen"
                    },
                    {
                        "id": "4",
                        "name": "Österreicher"
                    }
                ]
            }
        })
    })

    it("Search with exact characters", async function () {
        let result = await graphql(`
            {searchDynasty(text: "Ös") ${body}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "searchDynasty": [
                    {
                        "id": "2",
                        "name": "Franzosen"
                    },
                    {
                        "id": "4",
                        "name": "Österreicher"
                    }
                ]
            }
        })
    })

    it("Unauthorized Add Rejected", async function () {
        let promise = graphql(`mutation{addDynasty(name:"test")}`)
        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Add", async function () {
        let promise = graphql(`mutation{addDynasty(name:"test")}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })


    it("Unauthorized Update Rejected", async function () {
        let promise = graphql(`mutation{updateDynasty(id:6, name: "changed")}`)
        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Update", async function () {
        let promise = graphql(`mutation{updateDynasty(id:6, name: "changed")}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })

    it("Unauthorized Delete Rejected", async function () {
        let promise = graphql(`mutation{deleteDynasty(id:6)}`)
        await expect(promise).to.be.rejectedWith(["404"])
    })

    it("Delete", async function () {
        let promise = graphql(`mutation{deleteDynasty(id:6)}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })

    it("Table is the same as when started", async function () {
        let result = await graphql(`{dynasty ${body}}`)
        expect(result.data).to.deep.equal(startData)
    })

})
