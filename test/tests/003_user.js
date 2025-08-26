const chai = require('chai')
const expect = chai.expect
// const chaiGraphQL = require('chai-graphql')
// chai.use(chaiGraphQL)

const AuthResponse = require('../helpers/authresponse')

const { graphql } = require('../helpers/graphql')
const { allUsers, User, Editor, SuperUser, Writer, TypeEditor, ensureSuperUser, ensureUsers } = require('../mockdata/users')

const TestUser = require('../helpers/test-user')
const tempUserlist = []

let num = 0
const createDummyUser = ({email = null, permissions = []} = {}) => {
    const dummyEmail = email ?? `test_${num++}@dummy.com`
    return new TestUser(dummyEmail, "dummy-password", permissions)
}

async function GetUser(id, granter) {
    if(!id) throw new Error("User ID is required")
    const promise = graphql(`query GetUser($id:ID!){
        getUser(id:$id){id email super permissions}
      }`, { id }, granter?.token)
    return new Promise(async (resolve, reject) => {
        try {
            const response = await promise
            resolve(response.data.data.getUser)
        } catch (error) {
            reject(error)
        }
    })
}

async function GetUserByMail(email, granter) {
    if (!email) throw new Error("User email is required")
    const promise = graphql(`query GetUserByMail($email:String!){
        getUserByMail(email:$email){id email super permissions}
      }`, { email }, granter?.token)

    return new Promise(async (resolve, reject) => {
        try {
            const response = await promise
            resolve(response.data.data.getUserByMail)
        } catch (error) {
            reject(error)
        }
    })
}

async function InviteUser(user, superUser) {
    await graphql(`mutation InviteUser($email:String!){
        inviteUser(email: $email )
    }`, user, superUser?.token)
    tempUserlist.push(user)
}

async function AcceptInvite(user) {
    await graphql(`mutation AcceptInvite($email: String!, $password: String!){ acceptInvite(
        email: $email,
        password: $password
      )
      }`, user)
}

async function deleteUser(user, superUser) {
    if (!user.id) return graphql(`mutation DeleteUser($email:String!){ deleteUserByMail(email:$email) }`, { email: user.email }, superUser?.token)
    return graphql(`mutation DeleteUser($id:ID!){ deleteUser(id:$id) }`, { id: user.id }, superUser?.token)
}

async function registerUser(user) {
    await InviteUser(user, SuperUser)
    await AcceptInvite(user)
}

async function grantPermission(user, permission, granter = SuperUser) {
    return graphql(`mutation GrantPermission($user:ID!, $permission:String!) {grantPermission(user: $user, permission: $permission)}`, { user: user.id, permission }, granter?.token)
}
async function revokePermission(user, permission, granter = SuperUser) {
    return graphql(`mutation RevokePermission($user:ID!, $permission:String!) {revokePermission(user: $user, permission: $permission)}`, { user: user.id, permission }, granter?.token)
}

async function cleanupCreatedUsers() {
    let user;
    while (user = tempUserlist.pop()) {
        try {
            await deleteUser(user, SuperUser)
        } catch (e) {
            console.log("Could not delete user", e)
        }
    }
}


const loginQueryBody = `
success
message
token
user {
    id
    email
    super
}`


const Dummy = { user: null }
describe(`User management`, function () {

    this.beforeAll(async function(){
        await ensureSuperUser();
    })

    describe(`Super user`, function () {
        it(`Super user can log in`, async function () {
            const result = await graphql(`{ login(
            email: "${SuperUser.email}",
            password: "${SuperUser.password}"
          ){
              ${loginQueryBody}
            }
          }`)

            expect(result.data.data.login.token).is.not.null
            SuperUser.authenticate(result.data.data.login.token)
        })

        it(`Super user can invite new users`, async function () {
            const user = createDummyUser()
            const response = InviteUser(user, SuperUser)
            await expect(response).to.be.fulfilled
        })

        it(`Super user can get user by ID`, async function () {
            const promise = GetUser(1, SuperUser)
            const user = await expect(promise).to.be.fulfilled
            expect(user).to.deep.equal({
                id: "1",
                email: SuperUser.email,
                super: true,
                permissions: []
            })
        })

        it(`Super user can get user by email`, async function () {
            const promise = GetUserByMail(SuperUser.email, SuperUser)
            const user = await expect(promise).to.be.fulfilled
            expect(user).to.deep.equal({
                id: "1",
                email: SuperUser.email,
                super: true,
                permissions: []
            })
        })
    })

    describe(`Login regular user`, function () {
        this.beforeEach(async function () {
            Dummy.user = createDummyUser()
        })

        this.afterEach(async function () {
            await cleanupCreatedUsers()
        })

        it(`Regular user is not logged in.`, function () {
            expect(Dummy.user.isLoggedIn()).to.be.false
        })

        it(`Unregistered user cannot login`, async function () {
            const result = await graphql(`{ login(
                email: "${Dummy.user.email}",
                password: "${Dummy.user.password}"
              ){
                ${loginQueryBody}
                }
              }`)

            expect(AuthResponse.isInvalidResponse(result.data.data.login, {
                message: "Die Angaben waren Falsch! Bitte überprüfen Sie ihren Nutzernamen und das Passwort."
            })).to.be.true
        })

        it(`Uninvited user cannot accept an invite`, async function () {
            const response = graphql(`mutation{ acceptInvite(
                email: "${Dummy.user.email}",
                password: "${Dummy.user.password}"
              )
              }`)

            await expect(response).to.be.rejectedWith(['Could not set password!'])
        })

        it(`Uninvited user cannot send an invite`, async function () {
            const response = graphql(`
                mutation {
                    inviteUser(email: "${Dummy.user.email}" )
                }
            `)

            await expect(response).to.be.rejectedWith(["401"])
        })

        it(`User can accept invite`, async function () {
            await InviteUser(Dummy.user, SuperUser)
            const response = AcceptInvite(Dummy.user)
            await expect(response).to.be.fulfilled
        })

        it(`Invited user can log in`, async function () {
            await InviteUser(Dummy.user, SuperUser)
            await AcceptInvite(Dummy.user)
            const response = Dummy.user.login()
            await expect(response).to.be.fulfilled
            await expect(Dummy.user.isLoggedIn()).to.be.true
        })

    })

    describe(`Regular user`, function (before) {

        this.beforeAll(async function () {
            await ensureUsers()
        })

        this.beforeEach(async function () {
            Dummy.user = createDummyUser()
            await registerUser(Dummy.user, SuperUser)
            await Dummy.user.login()
        })

        this.afterEach(async function () {
            await cleanupCreatedUsers()
        })


        describe(`GetUser`, function () {

            it(`Externals cannot get user by id`, async function () {
                await expect(GetUser(1, null)).to.be.rejectedWith(["401"])
            })

            it(`Regular user cannot get user by id`, async function () {
                await expect(GetUser(1, Dummy.user)).to.be.rejectedWith(["401"])
            })

            it(`Super user can get user by id`, async function () {
                await expect(GetUser(1, SuperUser)).to.be.fulfilled
            })

            it(`Requested user is correct`, async function () {
                
                const email = "correctly@requested-user.mail"
                const user = createDummyUser({email})
                await registerUser(user, SuperUser)
                // assign id
                await user.login()

                let fetchedUser = await GetUser(user.id, SuperUser)
                expect(fetchedUser).to.deep.equal(
                    {
                        id: user.id,
                        super: false,
                        email: user.email,
                        permissions: []
                    }
                )
            })
        })

        describe("User List", function () {

            it(`Externals cannot view users list`, async function () {
                const result = graphql(`{users{id, super, email}}`)
                await expect(result).to.be.rejectedWith(["401"])
            })

            it(`Regular user cannot view users list`, async function () {
                const result = graphql(`{users{id, super, email}}`, {}, User.token)
                return expect(result).to.be.rejectedWith(["401"])
            })


            it(`Super user can view users list`, async function () {
                const result = graphql(`{users{id, super, email}}`, {}, SuperUser.token)
                await expect(result).to.be.fulfilled
            })
        })


        describe("Grant permissions", function () {

            describe("Super permission", function () {
                const permission = "super"

                it(`Externals cannot grant super permission`, async function () {
                    await expect(grantPermission(Dummy.user, permission, null)).to.be.rejectedWith(["401"])
                })

                it(`Regular user cannot grant super permission`, async function () {
                    await expect(grantPermission(Dummy.user, permission, Dummy.user)).to.be.rejectedWith(["401"])
                })

                it(`Super user can grant super permission`, async function () {
                    const promise = grantPermission(Dummy.user, permission, SuperUser)
                    await expect(promise).to.be.fulfilled
                    const targetUser = await GetUser(Dummy.user.id, SuperUser)
                    expect(targetUser.super).to.be.true
                })
            })

            describe("Grant regular permission", function () {
                const permission = "regular"

                it(`Externals cannot grant regular permission`, async function () {
                    await expect(grantPermission(Dummy.user, permission, null)).to.be.rejectedWith(["401"])
                })

                it(`Regular user cannot grant regular permission`, async function () {
                    await expect(grantPermission(Dummy.user, permission, Editor)).to.be.rejectedWith(["401"])
                })

                it(`Super user can grant regular permission`, async function () {
                    await grantPermission(Dummy.user, permission, SuperUser)
                    const user = await GetUser(Dummy.user.id, SuperUser)
                    expect(user.permissions.includes(permission)).to.be.true
                })
            })
        })

        describe("Revoke permissions", function () {

            this.beforeEach(async ()=> {
                await Dummy.user.login()
                await Dummy.user.setupPermissions(SuperUser, ["super"])
                const user = await GetUser(Dummy.user.id, SuperUser)
            })

            describe("Revoke super permission", function () {

                it(`Externals cannot revoke`, async function () {
                    await expect(revokePermission(Dummy.user, "super", null)).to.be.rejectedWith(["401"])
                })
                it(`Regular user cannot revoke`, async function () {
                    await expect(revokePermission(Dummy.user, "super", Writer)).to.be.rejectedWith(["401"])
                })
                it(`Super user can revoke`, async function () {
                    const beforeUser = await GetUser(Dummy.user.id, SuperUser)
                    await expect(beforeUser.super).to.be.true
                    await expect(revokePermission(Dummy.user, "super", SuperUser)).to.be.fulfilled
                    const user = await GetUser(Dummy.user.id, SuperUser)
                    await expect(user).to.deep.equal({
                        id: Dummy.user.id,
                        email: Dummy.user.email,
                        super: false,
                        permissions: []
                    })
                })
            })

            describe("Revoke regular permission", function () {

                const permission="revoke-permission"

                this.afterEach(async function () {
                    await revokePermission(Dummy.user, permission, SuperUser)
                })

                it(`Externals cannot revoke`, async function () {
                    await expect(revokePermission(Dummy.user, permission, null)).to.be.rejectedWith(["401"])
                })
                it(`Regular user cannot revoke`, async function () {
                    await expect(revokePermission(Dummy.user, permission, Dummy.user)).to.be.rejectedWith(["401"])
                })
                it(`Super user can revoke`, async function () {
                    await expect(revokePermission(Dummy.user, "super", SuperUser)).to.be.fulfilled
                    const user = await GetUser(Dummy.user.id, SuperUser)
                    await expect(user).to.deep.equal({
                        id: Dummy.user.id,
                        email: Dummy.user.email,
                        super: false,
                        permissions: []
                    })

                })
            })

            describe("Check if all Users are setup correctly", async function () {
                for (const user of allUsers) {
                    it(`Check if user "${user.email}" is logged in`, async function () {
                        expect(user.isLoggedIn()).to.be.true
                        expect(user.id).is.not.null
                    })
                }
            })

            describe("Grant all permissions", async function () {
                for (const user of allUsers) {
                    it(`Check if user "${user.email}" can be granted all permissions`, async function () {
                        await expect(user.setupPermissions(SuperUser)).to.be.fulfilled
                    })
                }
            })

            describe("Check if all users are setup properly", async function () {
                for (const user of allUsers) {
                    it(`Check if user "${user.email}" is setup `, async function () {
                        const result = await graphql(`query GetUser($id:ID!){
                        getUser(id:$id){id email super permissions}
                      }`, { id: user.id }, SuperUser.token)

                        expect(result.data.data.getUser).to.deep.equal({
                            id: user.id,
                            email: user.email,
                            super: user.super,
                            permissions: user.permissions
                        })
                    })
                }
            })
        })
    })
})