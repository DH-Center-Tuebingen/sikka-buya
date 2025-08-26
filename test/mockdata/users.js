const { graphql } = require('../helpers/graphql')
const TestUser = require('../helpers/test-user')

const SuperUser = new TestUser("tom.testa@example.com", "secure_password", ["super"])
const User = new TestUser("susan.sugar@example.com", "super_secure_password")
const Writer = new TestUser("writer@example.com", "always_use_strong_passwords", ["writer"]);
const Editor = new TestUser("editor@example.com", "always_use_strong_passwords", ["editor"]);
const TypeEditor = new TestUser("type-editor@example.com", "always_use_strong_passwords", ["type-editor"]);


const allUsers = [SuperUser, User, Writer, Editor, TypeEditor]

function getRestOfUsers(except = []) {
    except = except.map(user => user.email.toLowerCase())
    return allUsers.filter(user => !except.includes(user.email.toLowerCase()))
}

async function ensureSuperUser() {
    const { isSuperUserSet } = await graphql(`query {isSuperUserSet}`)
    if (!isSuperUserSet) {
        try {
            const { data } = await graphql(`mutation SuperUser{
            setup(email: "${SuperUser.email}", password: "${SuperUser.password}") { success }
        }`)
            const success = data?.data?.setup?.success
            if (!success) {
                throw new Error(`Failed to ensure super user!`)
            }
        } catch (e) {
            // If program is setup, it's okay
        }
    }

    if (!SuperUser.token) {
        await SuperUser.login()
    }
}

async function ensureUsers(users = null) {
    if (!SuperUser.token) throw new Error("SuperUser is not authenticated")

    if (!users)
        users = getRestOfUsers([SuperUser])

    for (const user of users) {
        try {
            // Check if user does exist
            const user = await graphql(`query GetUserByMail($mail: String!) {
                getUserByMail(email: $mail) {
                    id
                    email
                    super
                    permissions
                }
            }`, { mail: user.email }, SuperUser.token)
        } catch (error) {
            await SuperUser.invite(user.email)
            await user.acceptInvite()
            await user.login()
            await user.setupPermissions(SuperUser)
        }
    }

}

module.exports = {
    allUsers,
    SuperUser,
    User,
    Writer,
    Editor,
    TypeEditor,
    ensureSuperUser,
    ensureUsers,
    getRestOfUsers,
}