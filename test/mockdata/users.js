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

async function setupAllUsers() {
    for (const user of getRestOfUsers([SuperUser])) {
        await SuperUser.invite(user.email)
        await user.acceptInvite()
    }
}

module.exports = {
    allUsers,
    SuperUser,
    User,
    Writer,
    Editor,
    TypeEditor,
    getRestOfUsers,
    setupAllUsers,
}