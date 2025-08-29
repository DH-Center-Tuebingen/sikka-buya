const chai = require('chai')
const expect = chai.expect
const { graphql } = require('../helpers/graphql')
const { SuperUser, Editor, TypeEditor, getRestOfUsers, allUsers } = require('../mockdata/users')
const path = require("path")
const fs = require("fs").promises

const {
    COIN_TYPE_BODY,
    GERMAN_TYPE,
    FRENCH_TYPE,
    GERMAN_TYPE_WHEN_LOGGED_IN,
    FRENCH_TYPE_WHEN_LOGGED_IN,
    ATLANTIS_TYPE,
    ATLANTIS_INPUT,
    FRENCH_INPUT_UPDATED,
    FRENCH_TYPE_UPDATED,
    SPANISH_TYPE,
    SPANISH_TYPE_WHEN_LOGGED_IN,
} = require('../mockdata/type.mock')
const { WriteableDatabase } = require('../../backend/src/utils/database')
const { resetTestDatabase, setupTestDatabase, applyDummySetup } = require('../tasks/setup')
const Auth = require('../../backend/src/auth')


const validUsers = [SuperUser, Editor, TypeEditor]
const invalidUsers = getRestOfUsers(validUsers)

chai.config.truncateThreshold = 0
chai.config.showDiff = true

async function getCoinType(id, whenLoggedIn = false) {
    try {
        const result = await graphql(`
        {
            getCoinType(id:${id}) {
                ${COIN_TYPE_BODY}
            }
        }`, {}, whenLoggedIn ? SuperUser.token : undefined
        )
        return result.data.data.getCoinType
    } catch (e) {
        console.log(e)
    }
}

async function listCoinTypes(whenLoggedIn = false) {
    let result = await graphql(`{ coinType{
          types {
          ${COIN_TYPE_BODY}
        }}}`, {}, whenLoggedIn ? SuperUser.token : undefined)

    return result.data.data.coinType.types
}

async function searchCoinType(searchString, whenLoggedIn = false) {
    let result = await graphql(`
              {
                coinType(filters:{plain_text: "${searchString}"}){
                  pageInfo {page count last total}
                  types { 
                    ${COIN_TYPE_BODY}
                  }
                }
              }`, {}, whenLoggedIn ? SuperUser.token : undefined)

    return result.data.data.coinType;
}

describe(`Type Queries`, function () {

    describe(`List`, async function () {

        it("... when not logged in", async function () {
            let list = await listCoinTypes()
            expect(list).to.deep.equal([
                FRENCH_TYPE,
                GERMAN_TYPE,
                SPANISH_TYPE,
            ])
        })

        it("... when logged in", async function () {
            let list = await listCoinTypes(true)
            expect(list).to.deep.equal([
                FRENCH_TYPE_WHEN_LOGGED_IN,
                GERMAN_TYPE_WHEN_LOGGED_IN,
                SPANISH_TYPE_WHEN_LOGGED_IN,
            ])
        })
    })

    describe("Get", async function () {

        it("... when not logged in", async function () {
            let coin = await getCoinType(2)
            expect(coin).to.deep.equal(FRENCH_TYPE)
        })

        it("... when logged in", async function () {
            let coin = await getCoinType(2, true)
            expect(coin).to.deep.equal(FRENCH_TYPE_WHEN_LOGGED_IN)
        })
    })

    describe("Search", async function () {

        const config = {
            withExactCharacters: "FRévô1789",
            withRegularCharacters: "frevo1789",
            whenSearchingInternalNotes: "Überprüfen"
        }

        describe("... when logged in", async function () {
            for (const [key, value] of Object.entries(config)) {
                it(`Search with ${key}`, async function () {
                    let result = await searchCoinType(value, true)

                    expect(result).to.deep.equal({
                        "pageInfo": {
                            "page": 0,
                            "count": 20,
                            "last": 0,
                            "total": 1
                        },
                        "types": [
                            FRENCH_TYPE_WHEN_LOGGED_IN
                        ]
                    })
                })
            }
        })

        describe("... when not logged in", async function () {
            for (const [key, value] of Object.entries(config)) {
                it(`Search with ${key}`, async function () {
                    let result = await searchCoinType(value)
                    let expectedPagination = {
                        "page": 0,
                        "count": 20,
                        "last": 0,
                        "total": 1
                    }
                    let expected = [FRENCH_TYPE]

                    if ("whenSearchingInternalNotes" === key) {
                        expected = []
                        expectedPagination.total = 0
                    }


                    expect(result).to.deep.equal({
                        "pageInfo": expectedPagination,
                        "types": expected
                    })
                })
            }
        })
    });

    describe("Add", async function () {

        const query = `mutation{addCoinType(data: ${ATLANTIS_INPUT})}`

        it("Unauthorized Add Rejected", async function () {
            let promise = graphql(query)
            await expect(promise).to.be.rejectedWith(["401"])
        })

        describe("... check with user permissions", async function () {

            this.afterEach(async function () {
                await setupTestDatabase({ silent: true })

                for (const user of allUsers) {
                    const hashedPW = await Auth.hashPassword(user.password)
                    WriteableDatabase.none(`INSERT INTO app_user (id, email, password, super) VALUES ($[id], $[email], $[password], $[superUser])`, { ...user, password: hashedPW })
                    for (const permission of user.permissions) {
                        WriteableDatabase.none(`INSERT INTO app_user_privilege (app_user, privilege) VALUES ($[appUser], $[privilege])`, { appUser: user.id, privilege: permission })
                    }
                }
            })

            validUsers.forEach(user => {
                it(`Add of user with permission ${user.permissionName} succeeded`, async function () {
                    let promise = graphql(query, {}, SuperUser.token)
                    await expect(promise).to.be.fulfilled
                    let typeList = await listCoinTypes(true)
                    expect(typeList).to.deep.equal([
                        ATLANTIS_TYPE,
                        FRENCH_TYPE_WHEN_LOGGED_IN,
                        GERMAN_TYPE_WHEN_LOGGED_IN,
                        SPANISH_TYPE_WHEN_LOGGED_IN,
                    ])
                })
            })

            invalidUsers.forEach(user => {
                it(`Add of user without permission ${user.permissionName} failed`, async function () {
                    let promise = graphql(query, {}, user.token)
                    await expect(promise).to.be.rejectedWith(["403"])
                    let typeList = await listCoinTypes(true)
                    expect(typeList).to.deep.equal([
                        FRENCH_TYPE_WHEN_LOGGED_IN,
                        GERMAN_TYPE_WHEN_LOGGED_IN,
                        SPANISH_TYPE_WHEN_LOGGED_IN,
                    ])
                })
            })
        })

    })


    describe("Update", async function () {

        it("Unauthorized Update Rejected", async function () {
            let promise = graphql(`mutation{updateCoinType(id:3,data: ${FRENCH_INPUT_UPDATED} )}`)
            await expect(promise).to.be.rejectedWith(["401"])
        })

        describe("... check with user permissions", async function () {

            this.afterEach(async function () {
                await setupTestDatabase({ silent: true })

                for (const user of allUsers) {
                    const hashedPW = await Auth.hashPassword(user.password)
                    WriteableDatabase.none(`INSERT INTO app_user (id, email, password, super) VALUES ($[id], $[email], $[password], $[superUser])`, { ...user, password: hashedPW })
                    for (const permission of user.permissions) {
                        WriteableDatabase.none(`INSERT INTO app_user_privilege (app_user, privilege) VALUES ($[appUser], $[privilege])`, { appUser: user.id, privilege: permission })
                    }
                }
            })

            const query = `mutation{updateCoinType(id:2,data:${FRENCH_INPUT_UPDATED})}`
            validUsers.forEach(user => {
                it(`Update of user with permission ${user.permissionName} succeeded`, async function () {
                    // Here we double check that the afterEach hook reset the coin type properly.
                    const beforeType = await getCoinType(2, true)
                    await expect(beforeType).to.deep.equal(FRENCH_TYPE_WHEN_LOGGED_IN)
                    // Perform the update
                    let promise = graphql(query, {}, user.token)
                    await expect(promise).to.be.fulfilled
                    // Check if the coin type was updated correctly
                    let coinType = await getCoinType(2, true)
                    expect(coinType).to.deep.equal(FRENCH_TYPE_UPDATED)
                })
            })

            invalidUsers.forEach(user => {
                it(`Update of user without permission ${user.permissionName} failed`, async function () {
                    let promise = graphql(query, {}, user.token)
                    await expect(promise).to.be.rejectedWith(["403"])
                    let coinType = await getCoinType(2, true)
                    expect(coinType).to.deep.equal(FRENCH_TYPE_WHEN_LOGGED_IN)
                })
            })
        })

    })

    describe("Delete", async function () {

        it("Unauthorized Delete Rejected", async function () {
            let promise = graphql(`mutation {
          deleteCoinType(id: 3)
        }`)
            await expect(promise).to.be.rejectedWith(["401"])
        })

        describe("... check with user permissions", async function () {

            this.afterEach(async function () {
                await setupTestDatabase({ silent: true })

                for (const user of allUsers) {
                    const hashedPW = await Auth.hashPassword(user.password)
                    await WriteableDatabase.none(`INSERT INTO app_user (id, email, password, super) VALUES ($[id], $[email], $[password], $[superUser])`, { ...user, password: hashedPW })
                    for (const permission of user.permissions) {
                        await WriteableDatabase.none(`INSERT INTO app_user_privilege (app_user, privilege) VALUES ($[appUser], $[privilege])`, { appUser: user.id, privilege: permission })
                    }
                }
            })

            const query = `mutation{deleteCoinType(id:3)}`
            validUsers.forEach(user => {
                it(`Delete of user with permission ${user.permissionName} succeeded`, async function () {
                    // Here we double check that the afterEach hook reset the coin type properly.
                    const beforeType = await getCoinType(3, true)
                    await expect(beforeType).to.deep.equal(SPANISH_TYPE_WHEN_LOGGED_IN)
                    // Perform the update
                    let promise
                    try {
                        promise = graphql(query, {}, user.token)
                        await promise
                    } catch (e) {
                        console.trace(e)
                    }
                    await expect(promise).to.be.fulfilled
                    // Check if the coin type was updated correctly
                    const list = await listCoinTypes(true)
                    expect(list).to.deep.equal([FRENCH_TYPE_WHEN_LOGGED_IN, GERMAN_TYPE_WHEN_LOGGED_IN])
                })
            })

            invalidUsers.forEach(user => {
                it(`Delete of user without permission ${user.permissionName} failed`, async function () {
                    let promise = graphql(query, {}, user.token)
                    await expect(promise).to.be.rejectedWith(["403"])
                    let coinType = await getCoinType(3, true)
                    expect(coinType).to.deep.equal(SPANISH_TYPE_WHEN_LOGGED_IN)
                })
            })
        })
    })

})

