const start = require('../../backend/express');

function runBackendServer() {
    return start({
        dbUser: process.env.DB_USER,
        dbPassword: process.env.DB_PASSWORD,
        dbPort: process.env.DB_PORT,
        dbHost: process.env.DB_HOST,
        dbName: process.env.DB_NAME,
        expressPort: 4000,
        jwtSecret: "totally_secure_test_secret",
        testEnvironment: true
    })
}

if (require.main === module) {
    runBackendServer().catch(console.error)
} else {
    module.exports = runBackendServer
}