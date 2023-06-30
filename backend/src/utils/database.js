require("dotenv").config()

const pgp = require("pg-promise")({
    // This logs the queries that are executed
    query: function (e) {
        console.log(e.query);
    }
})

if (!process.env.DB_USER) {
    throw new Error("Make sure to run the script from the root of the project, that contains the .env file.")
}


const WriteableDatabase = pgp({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})

const Database = pgp({
    user: process.env.DB_READ_ONLY_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_READ_ONLY_PASSWORD,
    port: process.env.DB_PORT
})

const QueryFileMap = {}

function getQueryFile(key) {
    return QueryFileMap[key] || null
}

function addQueryFile(key, queryFile) {
    QueryFileMap[key] = queryFile
}



module.exports = {
    Database,
    WriteableDatabase,
    pgp,
    QueryFile: pgp.QueryFile,
    getQueryFile,
    addQueryFile
}