const chai = require('chai')
const expect = chai.expect
// const chaiGraphQL = require('chai-graphql')
// chai.use(chaiGraphQL)

const AuthResponse = require('../helpers/authresponse')

const { graphql } = require('../helpers/graphql')
const { allUsers, User, Editor, SuperUser, Writer, TypeEditor } = require('../mockdata/users')


async function GetUser(user, granter) {
    return graphql(`query GetUser($id:ID!){
        getUser(id:$id){id super permissions}
      }`, { id: user.id }, granter?.token)
}

async function InviteUser(user, superUser) {
    await graphql(`mutation InviteUser($email:String!){
        inviteUser(email: $email )
    }`, user, superUser?.token)
}

async function AcceptInvite(user) {
    await graphql(`mutation AcceptInvite($email: String!, $password: String!){ acceptInvite(
        email: $email,
        password: $password
      )
      }`, user)
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


const loginQueryBody = `
success
message
token
user {
    id
    email
    super
}`

describe(`User management`, function () {

    it(`Regular user is not logged in.`, function () {
        expect(User.isLoggedIn()).to.be.false
    })

    it(`Unregistered user cannot login`, async function () {
        const user = User
        const result = await graphql(`{ login(
            email: "${user.email}",
            password: "${user.password}"
          ){
            ${loginQueryBody}
            }
          }`)

        expect(AuthResponse.isInvalidResponse(result.data.data.login, {
            message: "Die Angaben waren Falsch! Bitte überprüfen Sie ihren Nutzernamen und das Passwort."
        })).to.be.true

    })


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

    it(`Uninvited user cannot accept an invite`, async function () {
        const user = User
        const response = graphql(`mutation{ acceptInvite(
            email: "${user.email}",
            password: "${user.password}"
          )
          }`)

        await expect(response).to.be.rejectedWith(['Could not set password!'])

    })

    it(`Uninvited user cannot send an invite`, async function () {
        const response = graphql(`
            mutation {
                inviteUser(email: "${Editor.email}" )
            }
        `)

        await expect(response).to.be.rejectedWith(["401"])

    })

    it(`Super user can invite new users`, async function () {
        const response = graphql(`
            mutation {
                inviteUser(email: "${User.email}" )
            }
        `, {}, SuperUser.token)


        await expect(response).to.be.fulfilled
    })


    it(`User can accept invite`, async function () {
        const response = graphql(`mutation{ acceptInvite(
            email: "${User.email}",
            password: "${User.password}"
          )
          }`)

        await expect(response).to.be.fulfilled
    })


    it(`Invited user can log in`, async function () {
        const result = await User.login()
        expect(result.data.data.login.token).is.not.null
        User.authenticate(result.data.data.login.token)
    })

    describe(`GetUser`, function () {

        const req = `{getUser(id:3){id, super, email, permissions }}`

        this.beforeAll(async function () {
            await registerUser(Editor, SuperUser)
        })

        it(`Externals cannot get user by id`, async function () {
            const result = graphql(req)
            await expect(result).to.be.rejectedWith(["401"])
        })

        it(`Regular user cannot get user by id`, async function () {
            const result = graphql(req, {}, Editor.token)
            await expect(result).to.be.rejectedWith(["401"])
        })

        it(`Super user can get user by id`, async function () {
            await expect(graphql(req, {}, SuperUser.token)).to.be.fulfilled
        })

        it(`Requested user is correct`, async function () {

            let result = await graphql(req, {}, SuperUser.token)
            let obj = result.data.data.getUser

            expect(obj).to.deep.equal(
                {
                    id: "3",
                    super: false,
                    email: Editor.email,
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
                await expect(grantPermission(User, permission, null)).to.be.rejectedWith(["401"])
            })

            it(`Regular user cannot grant super permission`, async function () {
                await expect(grantPermission(User, permission, Editor)).to.be.rejectedWith(["401"])
            })

            it(`Super user can grant super permission`, async function () {
                await expect(grantPermission(User, permission, SuperUser))
                const result = await graphql(`query GetUser($id:ID!){
                    getUser(id:$id){id super permissions}
                  }`, { id: User.id }, SuperUser.token)

                const data = result.data.data.getUser
                expect(data.super).to.be.true
            })
        })

        describe("Grant regular permission", function () {
            const permission = "regular"

            it(`Externals cannot grant regular permission`, async function () {
                await expect(grantPermission(User, permission, null)).to.be.rejectedWith(["401"])
            })

            it(`Regular user cannot grant regular permission`, async function () {
                await expect(grantPermission(User, permission, Editor)).to.be.rejectedWith(["401"])
            })

            it(`Super user can grant regular permission`, async function () {
                await grantPermission(User, permission, SuperUser)
                // const result = await GetUser(User, SuperUser )
                // const data = result.data.data.getUser
                // expect(data.permissions.includes(permission)).to.be.true
            })
        })
    })

    describe("Revoke permissions", function () {
        describe("Revoke super permission", function () {

            const targetUser = Writer
            const permission = "super"

            this.beforeAll(async function () {
                await registerUser(Writer)
                await Writer.login()
            })

            this.beforeEach(async function () {
                await grantPermission(targetUser, permission)
            })

            it(`Externals cannot revoke`, async function () {
                await expect(revokePermission(targetUser, permission, null)).to.be.rejectedWith(["401"])
            })
            it(`Regular user cannot revoke`, async function () {
                await expect(revokePermission(targetUser, permission, Writer)).to.be.rejectedWith(["401"])
            })
            it(`Super user can revoke`, async function () {
                await expect(revokePermission(targetUser, permission, SuperUser)).to.be.fulfilled
                const result = await GetUser(targetUser, SuperUser)
                const user = result.data.data.getUser
                await expect(user).to.deep.equal({
                    id: '4',
                    super: false,
                    permissions: []
                })
            })
        })

        describe("Revoke regular permission", function () {

            const targetUser = Writer
            const permission = "regular"

            this.beforeAll(async function () {
                try {
                    await registerUser(Writer)
                } catch (e) { // Fails if already registered}
                    await Writer.login()
                }
            })

            this.beforeEach(async function () {
                await revokePermission(targetUser, permission, SuperUser)
            })

            it(`Externals cannot revoke`, async function () {
                await expect(revokePermission(targetUser, permission, null)).to.be.rejectedWith(["401"])
            })
            it(`Regular user cannot revoke`, async function () {
                await expect(revokePermission(targetUser, permission, User)).to.be.rejectedWith(["401"])
            })
            it(`Super user can revoke`, async function () {
                await expect(revokePermission(targetUser, permission, SuperUser)).to.be.fulfilled
                const result = await GetUser(targetUser, SuperUser)
                const user = result.data.data.getUser
                await expect(user).to.deep.equal({
                    id: '4',
                    super: false,
                    permissions: []
                })

            })
        })

        describe("Login all users", async function () {
            this.beforeAll(async function () {
                await registerUser(TypeEditor)
            })

            for (const user of allUsers) {
                it(`Check if user "${user.email}" can login`, async function () {
                    await expect(user.login()).to.be.fulfilled
                })
            }
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
                    console.log(user.id)
                    const result = await graphql(`query GetUser($id:ID!){
                    getUser(id:$id){id super permissions}
                  }`, { id: user.id }, SuperUser.token)

                    expect(result.data.data.getUser).to.deep.equal({
                        id: user.id,
                        email: user.email,
                        super: user.superUser,
                        permissions: user.permissions
                    })
                })
            }
        })
    })

})