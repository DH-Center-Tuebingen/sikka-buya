const TestUser = require('../helpers/test-user')

const SuperUser = new TestUser("tom.testa@example.com", "secure_password", true)
const User1 = new TestUser("susan.sugar@example.com", "super_secure_password")
const User2 = new TestUser("mona.mohrruebe@example.com", "always_use_strong_passwords")
const User3 = new TestUser("super@example.com", "always_use_strong_passwords")
const User4 = new TestUser("ruediger.hund@example.com", "always_use_strong_passwords")
const TypeEditor = new TestUser("type.editor@example.com", "always_use_strong_passwords");


module.exports = {
    SuperUser,
    User1,
    User2,
    User3,
    User4,
    TypeEditor,
}