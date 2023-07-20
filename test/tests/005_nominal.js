const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')

describe(`Nominal Queries`, function () {
    it(`List`, async function () {
        let result = await graphql(`{nominal ${body}}`)

        expect(result.data).to.deep.equal(startData)
    })

    it("Get", async function () {
        let result = await graphql(`
        {
            getNominal(id:2) ${body}
        }
`)

        expect(result.data).to.deep.equal({
            "data": {
                "getNominal": {
                    "id": "2",
                    "name": "1 Mark"
                }
            }
        })
    })

    it("Search with regular characters", async function () {
        let result = await graphql(`
            {searchNominal(text: "zl") ${body}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "searchNominal": [
                    {
                        "id": "4",
                        "name": '1 Złoty'
                    }
                ]
            }
        })
    })

    it("Search with exact characters", async function () {
        let result = await graphql(`
            {searchNominal(text: "Zł") ${body}}`)

        expect(result.data).to.deep.equal({
            "data": {
                "searchNominal": [
                    {
                        "id": "4",
                        "name": '1 Złoty'
                    }
                ]
            }
        })
    })

    it("Unauthorized Add Rejected", async function () {
        let promise = graphql(`mutation{addNominal(name:"test")}`)
        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Add", async function () {
        let promise = graphql(`mutation{addNominal(name:"test")}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })


    it("Unauthorized Update Rejected", async function () {
        let promise = graphql(`mutation{updateNominal(id:6, name: "changed")}`)
        await expect(promise).to.be.rejectedWith(["401"])
    })

    it("Update", async function () {
        let promise = graphql(`mutation{updateNominal(id:6, name: "changed")}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })

    it("Unauthorized Delete Rejected", async function () {
        let promise = graphql(`mutation{deleteNominal(id:5)}`)
        await expect(promise).to.be.rejectedWith(["404"])
    })

    it("Delete", async function () {
        let promise = graphql(`mutation{deleteNominal(id:5)}`, {}, User1.token)
        await expect(promise).to.be.fulfilled
    })

    it("Table is the same as when started", async function () {
        let result = await graphql(`{nominal ${body}}`)
        expect(result.data).to.deep.equal(startData)
    })

})
