const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User1 } = require('../mockdata/users')
const { search } = require('../../backend/src/models/mint')
const { arrayRequired, required, messageFromValidator } = require('./requirements')


class PropertyTest {

    constructor(name, {
        GQL_BODY = null,
        listData = null,
        getData = null,
        searchData = null,
        searchText = null,
        searchTextExact = null,
        addData = null,
        addInput = null,
        updateId = null,
        updateInput = null,
        updateData = null,
    } = {}) {
        this.name = name
        this.additionalTests = {}

        const missingConfigOptions = []

        const requiredOptions = {
            GQL_BODY: required,
            listData: required,
            getData: required,
            getDataId: required,
            searchData: arrayRequired,
            searchText: required,
            searchTextExact: required,
            addData: required,
            addInput: required,
            updateId: required,
            updateInput: required,
            updateData: required,
            deleteId: required,
            deleteData: required,
            deletedListData: arrayRequired,
        }

        for (const [key, validator] of Object.entries(requiredOptions)) {
            const value = arguments[1][key]

            if (!validator(value)) {
                const msg = messageFromValidator(validator, key, value)
                missingConfigOptions.push(msg)
            } else {
                if (this[key]) throw new Error(`Duplicate key: ${key}`)
                this[key] = value
            }
        }

        if (missingConfigOptions.length > 0) {
            throw new Error(`Missing required options:\n${missingConfigOptions.join("\n ")}`)
        }

    }

    get tests() {
        return [
            this.access,
            this.search,
            this.add,
            // this.update,
            // this.delete
        ]
    }

    get capitalizedName() {
        return this.name.charAt(0).toUpperCase() + this.name.slice(1)
    }

    get listQuery() {
        return `{${this.name} ${this.GQL_BODY}}`
    }

    get getQueryName() {
        return `get${this.capitalizedName}`
    }

    getQuery(id) {
        return `{
            ${this.getQueryName}(id:${id}) ${this.GQL_BODY}
        }`
    }

    access(klass) {
        it(`List`, async function () {
            let result = await graphql(klass.listQuery)
            expect(result.data).to.deep.equal({
                data: {
                    [klass.name]: klass.listData
                }
            })
        })

        it("Get", async function () {
            let result = await graphql(klass.getQuery(klass.getData.id))
            expect(result.data).to.deep.equal({
                data: {
                    [klass.getQueryName]: klass.getData
                }
            })
        })

        klass.runAdditionalTests(klass, "access")
    }

    addTest(category, ...testFunctions) {
        if (testFunctions.length === 0) throw new Error("No test functions provided")
        if (!this.additionalTests[category]) this.additionalTests[category] = []
        this.additionalTests[category].push(...testFunctions)
    }

    runAdditionalTests(klass, category) {
        if (!klass.additionalTests[category]) return
        klass.additionalTests[category].forEach(fun => fun(klass))
    }

    search(klass) {
        describe("Search", function () {

            const queryName = `search${klass.capitalizedName}`
            const query = `{${queryName}(text: "${klass.searchText}") ${klass.GQL_BODY}}`
            const expected = {
                "data": {
                    [queryName]: klass.searchData
                }
            }

            it("Search with regular characters", async function () {
                let result = await graphql(query)
                expect(result.data).to.deep.equal(expected)
            })

            it("Search with exact characters", async function () {
                let result = await graphql(query)
                expect(result.data).to.deep.equal(expected)
            })

            klass.runAdditionalTests(klass, "search")
        })
    }

    add(klass) {
        describe("Add", function () {
            const queryName = `add${klass.capitalizedName}`
            const query = `mutation{${queryName}( ${klass.addInput} )}`


            it("Unauthorized Add Rejected", async function () {
                let promise = graphql(query)
                await expect(promise).to.be.rejectedWith(["401"])
            })

            it("Item was not added", async function () {
                let result = await graphql(klass.listQuery)
                expect(result.data.data[klass.name]).to.not.deep.include(klass.addData)
            })

            it("Add", async function () {
                let promise = graphql(query, {}, User1.token)
                await expect(promise).to.be.fulfilled
            })

            it("Item was added", async function () {
                let result = await graphql(klass.listQuery)
                expect(result.data.data[klass.name]).to.deep.include(klass.addData)
            })

            it("Added item is correct", async function () {
                let result = await graphql(klass.getQuery(klass.addData.id))
                expect(result.data.data[klass.getQueryName]).to.deep.equal(klass.addData)
            })

            klass.runAdditionalTests(klass, "add")

        })
    }

    update(klass) {
        describe("Update", function () {

            const queryName = `update${klass.capitalizedName}`
            const query = `mutation{${queryName}(id: ${klass.updateId}, ${klass.updateInput} )}`

            it("Unauthorized Update Rejected", async function () {
                let promise = graphql(query)
                await expect(promise).to.be.rejectedWith(["401"])
            })

            it("Update", async function () {
                let promise = graphql(query, {}, User1.token)
                await expect(promise).to.be.fulfilled
            })

            it("Updated item is correct", async function () {
                let result = await graphql(klass.getQuery(klass.updateId))
                expect(result.data.data[klass.getQueryName]).to.deep.equal(klass.updateData)
            })

            klass.runAdditionalTests(klass, "update")
        })
    }

    delete(klass) {
        describe("Delete", function () {
            const queryName = `delete${klass.capitalizedName}`
            const query = `mutation{${queryName}(id: ${klass.deleteId})}`

            it("Deleted item is present", async function () {
                let result = await graphql(klass.listQuery)
                expect(result.data.data[klass.name]).to.deep.include(klass.deleteData)
            })

            it("Unauthorized Delete Rejected", async function () {
                let promise = graphql(query)
                await expect(promise).to.be.rejectedWith(["404"])
            })

            it("Deleted item is still present", async function () {
                let result = await graphql(klass.listQuery)
                expect(result.data.data[klass.name]).to.deep.include(klass.deleteData)
            })

            it("Delete", async function () {
                let promise = graphql(query, {}, User1.token)
                await expect(promise).to.be.fulfilled
            })

            it("Item was deleted successfully", async function () {
                let result = await graphql(klass.listQuery)
                expect(result.data.data[klass.name]).to.deep.equal(klass.deletedListData)
            })

            klass.runAdditionalTests(klass, "delete")

        })
    }


    run() {
        // We need the klass but need to keep the mocha context.
        // so we just pass the class as variable but keep the context.
        let klass = this
        describe(`${this.capitalizedName} Queries`, function () {

            this.beforeEach(async function () {
                User1.login()
            })

            klass.tests.forEach(fun => fun(klass))
        })
    }
}

module.exports = PropertyTest
