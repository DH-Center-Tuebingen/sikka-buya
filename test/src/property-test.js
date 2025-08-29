const { expect } = require('chai')
const { graphql } = require('../helpers/graphql')
const { User, SuperUser, Editor, TypeEditor, getRestOfUsers, setupAllUsers } = require('../mockdata/users')
const { arrayRequired, required, messageFromValidator } = require('./requirements')
const { WriteableDatabase } = require('../../backend/src/utils/database')

const validUsers = [SuperUser, Editor]
const invalidUsers = getRestOfUsers(validUsers)

class PropertyTest {

    constructor(name, {
        database = null,
        GQL_BODY = null,
        listData = null,
        getData = null,
        searchData = null,
        searchText = null,
        searchTextExact = null,
        addData = null,
        addInput = null,
        updateInput = null,
        updateData = null,
        deleteData = null,

        // For some tests that require joined databases (e.g. material)
        // we need custom behavior to reset the database state.
        getOriginalEntry = null,
        afterUpdate = null,
        afterDelete = null
    } = {}, {
        only = false,
    } = {}) {
        this.name = name
        this.additionalTests = {}
        this.only = only

        const missingConfigOptions = []

        const requiredOptions = {
            database: required,
            GQL_BODY: required,
            listData: required,
            getData: required,
            getDataId: required,
            searchData: arrayRequired,
            searchText: required,
            searchTextExact: required,
            addData: required,
            addInput: required,
            updateInput: required,
            updateData: required,
            deleteData: required,
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

        // Optional options
        this.getOriginalEntry = getOriginalEntry
        this.afterUpdate = afterUpdate
        this.afterDelete = afterDelete

        if (missingConfigOptions.length > 0) {
            throw new Error(`Missing required options:\n${missingConfigOptions.join("\n ")}`)
        }

    }

    get tests() {
        return [
            this.access,
            this.search,
            this.add,
            this.update,
            this.delete
        ]
    }

    get capitalizedName() {
        return this.name.charAt(0).toUpperCase() + this.name.slice(1)
    }

    get listQuery() {
        return `{${this.name} ${this.GQL_BODY}}`
    }

    get updateId() {
        if (!this.updateData?.id) throw new Error("updateData must have an id property")
        return this.updateData.id
    }

    get deleteId() {
        if (!this.deleteData?.id) throw new Error("deleteData must have an id property")
        return this.deleteData.id
    }

    get deletedListData() {
        return this.listData.filter(item => item.id !== this.deleteId)
    }

    get getQueryName() {
        return `get${this.capitalizedName}`
    }

    getQuery(id) {
        return `{
            ${this.getQueryName}(id:${id}) ${this.GQL_BODY}
        }`
    }

    async _getOriginalEntry(id) {
        let originalEntry
        if (this.getOriginalEntry) {
            originalEntry = await this.getOriginalEntry(WriteableDatabase, this, id)
        } else {
            originalEntry = await WriteableDatabase.one(`SELECT * FROM ${this.database} WHERE id=${id}`)
        }

        originalEntry.id = originalEntry.id.toString()

        return originalEntry
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

            this.afterEach(async function () {
                const { exists } = await WriteableDatabase.one(`SELECT EXISTS(SELECT 1 FROM ${klass.database} WHERE id=${klass.addData.id}) AS exists`)
                if (exists) {
                    try {
                        await WriteableDatabase.tx(async t => {
                            await t.none(`DELETE FROM ${klass.database} WHERE id=${klass.addData.id}`)
                            //Reset counter to the last id value.
                            await t.none(`ALTER SEQUENCE ${klass.database}_id_seq RESTART WITH ${klass.addData.id}`)
                        })
                    } catch (error) {
                        console.error("DELETION ERROR occurred:", error)
                    }
                }
            })

            it("Unauthorized Add Rejected", async function () {
                let promise = graphql(query)
                await expect(promise).to.be.rejectedWith(["401"])
            })

            it("Item was not added", async function () {
                let result = await graphql(klass.listQuery)
                expect(result.data.data[klass.name]).to.not.deep.include(klass.addData)
            })

            describe("Test Add for all users", async function () {
                validUsers.forEach(user => {
                    it(`Add of user with permission ${user.permissionName} succeeded`, async function () {
                        let promise = graphql(query, {}, SuperUser.token)
                        try {
                            await promise
                        } catch (error) {
                            console.error("Error occurred:", error)
                        }
                        await expect(promise).to.be.fulfilled
                        // Item was added
                        let addedResult = await graphql(klass.listQuery)
                        expect(addedResult.data.data[klass.name]).to.deep.include(klass.addData)
                        // Added item is correct
                        let compareResult = await graphql(klass.getQuery(klass.addData.id))
                        expect(compareResult.data.data[klass.getQueryName]).to.deep.equal(klass.addData)
                    })
                })

                invalidUsers.forEach(user => {
                    it(`Add of user without permission ${user.permissionName} failed`, async function () {
                        let promise = graphql(query, {}, user.token)
                        await expect(promise).to.be.rejectedWith(["403"])
                        // Item was not added
                        let addedResult = await graphql(klass.listQuery)
                        expect(addedResult.data.data[klass.name]).to.not.deep.include(klass.addData)
                    })
                })
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

            describe("Test Update for all users", async function () {

                let originalEntry = null
                this.beforeAll(async function () {
                    originalEntry = await klass._getOriginalEntry(klass.updateId)
                })

                this.afterEach("Testing update for all users", async function () {
                    if (klass.afterUpdate)
                        await klass.afterUpdate(WriteableDatabase, klass, originalEntry)
                    else {
                        await WriteableDatabase.none(`UPDATE ${klass.database} SET ${Object.keys(originalEntry).map((val, idx) => `${val}='${originalEntry[val]}'`).join(", ")} WHERE id=${klass.updateId}`)
                    }
                })

                validUsers.forEach(user => {
                    it(`Update of user with permission ${user.permissionName} succeeded`, async function () {
                        let promise = graphql(query, {}, user.token)
                        await expect(promise).to.be.fulfilled
                        let result = await graphql(klass.getQuery(klass.updateId))
                        expect(result.data.data[klass.getQueryName]).to.deep.equal(klass.updateData)
                    })
                })

                invalidUsers.forEach(user => {
                    it(`Update of user without permission ${user.permissionName} failed`, async function () {
                        let promise = graphql(query, {}, user.token)
                        await expect(promise).to.be.rejectedWith(["403"])
                        let result = await graphql(klass.getQuery(klass.updateId))
                        const updatedEntry = result.data.data[klass.getQueryName]
                        expect(updatedEntry).to.deep.equal(originalEntry)
                    })
                })
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

            describe("Test deletion for all users", async function () {

                let deletedEntry = null
                this.beforeAll(async function () {
                    deletedEntry = await klass._getOriginalEntry(klass.deleteId)
                })

                this.afterEach("Testing delete for all users", async function () {
                    const { exists } = await WriteableDatabase.one(`SELECT EXISTS(SELECT 1 FROM ${klass.database} WHERE id=${klass.deleteId}) AS exists`)
                    if (!exists) {
                        if (klass.afterDelete) {
                            await klass.afterDelete(WriteableDatabase, klass, deletedEntry)
                        } else {
                            await WriteableDatabase.none(`INSERT INTO ${klass.database} (${Object.keys(deletedEntry).join(", ")}) VALUES (${Object.values(deletedEntry).map(value => `'${value}'`).join(", ")})`)
                        }
                    }
                })

                for (const user of validUsers) {
                    it(`Delete of user with permission ${user.permissionName} succeeded`, async function () {
                        let promise = graphql(query, {}, user.token)
                        await expect(promise).to.be.fulfilled
                        // Item should still be deleted
                        let result = await graphql(klass.listQuery)
                        expect(result.data.data[klass.name]).to.deep.equal(klass.deletedListData)
                    })
                }

                for (const invalidUser of invalidUsers) {
                    it(`Delete of user without permission ${invalidUser.permissionName} failed`, async function () {
                        let promise = graphql(query, {}, invalidUser.token)
                        await expect(promise).to.be.rejectedWith(["403"])
                        // Item should still be present
                        let result = await graphql(klass.listQuery)
                        expect(result.data.data[klass.name]).to.deep.equal(klass.listData)
                    })
                }
            })

            klass.runAdditionalTests(klass, "delete")

        })
    }


    run() {
        // We need the klass but need to keep the mocha context.
        // so we just pass the class as variable but keep the context.
        let klass = this

        const fun = this.only ? describe.only : describe
        fun(`${this.capitalizedName} Queries`, function () {
            this.beforeEach(async function () {
                try {
                    await User.login()
                } catch (e) {
                    console.log(e)
                }

            })

            klass.tests.forEach(func => func(klass))
        })
    }
}

module.exports = PropertyTest
