const { WriteableDatabase } = require("../src/utils/database")


async function hasReadOnlyUser() {
    const result = await WriteableDatabase.oneOrNone(`SELECT 1 FROM pg_roles WHERE rolname=$[role]`, { role: process.env.DB_READ_ONLY_USER })
    return result == null ? false : true
}

async function dropReadOnlyUser() {
    const { username } = requireEnv({ username: "DB_READ_ONLY_USER" })

    return WriteableDatabase.tx(async t => {
        await t.any(`REASSIGN OWNED BY $[username:name] TO postgres`, { username })
        await t.any(`DROP OWNED BY $[username:name]`, { username })

        await t.any(`REVOKE ALL PRIVILEGES ON SCHEMA public FROM $[username:name]`, { username })
        await t.any(`DROP ROLE $[username:name]`, { username })
    })
}

function requireEnv(mapping) {
    missing = []
    const out = {}
    for (let [varName, envName] of Object.entries(mapping)) {
        if (!process.env[envName])
            missing.push(envName)
        else {
            out[varName] = process.env[envName]
        }
    }

    if (missing.length > 0) throw new Error(`Required env variables are missing! Make sure you run the script from backend root! Else add them in your .env file: ${missing.join(", ")}`)
    return out
}

async function createWritableUser() {

    const { username, password, dbName } = requireEnv({ username: "DB_USER", password: "DB_PASSWORD", dbName: "DB_NAME" })

    WriteableDatabase.tx(t => {
        const txs = []

        txs.push(t.any(`
        CREATE ROLE $[username:name] 
            WITH LOGIN PASSWORD $[password] 
        SUPERUSER
        VALID UNTIL 'infinity'`,
            { username, password }))

        txs.push(t.any(`GRANT CONNECT ON DATABASE $[dbName:name] TO $[username:name]`, { dbName, username }))
        txs.push(t.any(`GRANT USAGE ON SCHEMA public TO $[username:name]`, { username }))
        txs.push(t.any(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO $[username:name]`, { username }))
        txs.push(t.any(`GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO $[username:name]`, { username }))

        return t.batch(txs)

    }).then(() => resolve("Success")).catch((e) => {
        reject(`Could not create Role ${username}: ${e}`)
    })


}

async function createReadOnlyUser() {

    const { username, password, superUser, dbName } = requireEnv({ username: "DB_READ_ONLY_USER", password: "DB_READ_ONLY_PASSWORD", superUser: "DB_USER", dbName: "DB_NAME" })

    return new Promise((resolve, reject) => {

        WriteableDatabase.tx(async t => {
            await t.any(`
            CREATE ROLE $[username:name] 
                WITH LOGIN PASSWORD $[password] 
            NOSUPERUSER
            INHERIT
            NOCREATEDB
            NOCREATEROLE
            NOREPLICATION
            VALID UNTIL 'infinity'`,
                { username, password })

            await grantPermissionsToReadOnlyUser(t)

        }).then(() => resolve("Success")).catch((e) => {
            reject(`Could not create Role ${username}: ${e}`)
        })
    })
}

async function grantPermissionsToReadOnlyUser(t = null) {
    const { username, superUser, dbName } = requireEnv({ username: "DB_READ_ONLY_USER", superUser: "DB_USER", dbName: "DB_NAME" })

    async function applyPermissions(t) {
        await t.any(`GRANT CONNECT ON DATABASE $[dbName:name] TO $[username:name]`, { dbName, username })
        await t.any(`GRANT USAGE ON SCHEMA public TO $[username:name]`, { username })
        await t.any(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO $[username:name]`, { username })
        await t.any(`GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO $[username:name]`, { username })
        await t.any(`ALTER DEFAULT PRIVILEGES 
    FOR USER $[superUser:name]
    IN SCHEMA public
    GRANT SELECT ON TABLES TO $[readOnlyUser:name]`, { readOnlyUser: username, superUser })
    }

    if (!t) {
        return WriteableDatabase.tx(async t => {
            await t.any(`GRANT CONNECT ON DATABASE $[dbName:name] TO $[username:name]`, { dbName, username })
            await t.any(`GRANT USAGE ON SCHEMA public TO $[username:name]`, { username })
            await t.any(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO $[username:name]`, { username })
            await t.any(`GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO $[username:name]`, { username })
            await t.any(`ALTER DEFAULT PRIVILEGES 
            FOR USER $[superUser:name]
            IN SCHEMA public
            GRANT SELECT ON TABLES TO $[readOnlyUser:name]`, { readOnlyUser: username, superUser })
        })
    } else
        return applyPermissions(t)
}


module.exports = { createReadOnlyUser, dropReadOnlyUser, hasReadOnlyUser, createWritableUser, grantPermissionsToReadOnlyUser }


async function main() {
    const params = process.argv.slice(2)
    if (params.indexOf("-d") != -1 || params.indexOf("--drop") != -1) {
        await dropReadOnlyUser()
    }

    createReadOnlyUser().then((res) => console.log(`Script finished with result: ${res} `)).catch(console.error)
}

if (require.main === module) {
    main().then(console.log).catch(console.error)
} 
