const run = require("./express")

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
}

for (let [target, source] of Object.entries(map)) {
    if (!process.env[source]) throw new Error(`Property was not set on process.env '${source}'.`)

    process.env[target] = process.env[source]
}


run(process.env);