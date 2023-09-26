const run = require("./express")
const Settings = require("./src/models/settings")

if (!process.env.useCli) {
    require("dotenv").config()
}


const map = {
    expressPort: "EXPRESS_PORT",
    jwtSecret: "JWT_SECRET",
    dbName: "DB_NAME",
    dbUser: "DB_USER",
    dbHost: "DB_HOST",
    dbPort: "DB_PORT",
    dbPassword: "DB_PASSWORD",
    dbReadOnlyUser: "DB_READ_ONLY_USER",
    dbReadOnlyPassword: "DB_READ_ONLY_PASSWORD"
}

for (let [target, source] of Object.entries(map)) {
    if (!process.env[source]) throw new Error(`Property was not set on process.env '${source}'.`)

    process.env[target] = process.env[source]
}


run(process.env).then(() => {
    Settings.writeManagedFile().catch(e)
}).catch(console.error)