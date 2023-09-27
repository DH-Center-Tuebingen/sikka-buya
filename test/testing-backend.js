const { resetTestDatabase, recreateTestDatabase } = require('./tasks/setup.js')
const { join: joinPath } = require("path");
const start = require('../backend/express.js');
const { error } = require('../backend/scripts/modules/logging.js');
const Settings = require('../backend/src/models/settings.js');


function overwriteWithGithubActionsEnv() {
    const config = {
        POSTGRES_HOST: "DB_HOST",
        POSTGRES_PORT: "DB_PORT"
    }

    for (let { githubEnv, env } of Object.entries(config)) {
        if (process.env[githubEnv])
            process.env[env] = process.env[githubEnv]
    }
}

function verifyAllEnvVariablesAreSet() {
    const missingEnv = []

    const envs = [
        "DB_SUPER_NAME",
        "DB_SUPER_USER",
        "DB_SUPER_PASSWORD",
        "DB_USER",
        "DB_PASSWORD",
        "DB_NAME",
        "DB_HOST",
        "DB_PORT",
        "JWT_SECRET",
        "MAX_SEARCH"]

    envs.forEach(env => {
        if (!process.env[env])
            missingEnv.push(env)
    })

    if (missingEnv.length > 0) throw new Error(`Missing env variables: ${missingEnv.join(", ")}. Set them in the .env file in the test directory.`)
}


async function main() {

    if (!process.env.useCli) {
        require("dotenv").config()
    }

    overwriteWithGithubActionsEnv()
    verifyAllEnvVariablesAreSet()
    process.env.expressPort = 4000
    process.env.jwtSecret = "secret"

    let resetLock = false
    async function handler(req, res, next) {
        let status = 200
        let message = ""

        if (!resetLock) {
            resetLock = true

            res.setHeader('Content-Type', 'application/json');

            try {
                const { method } = req.body
                if (!method) {
                    status = 400
                    message = "Parameter 'method' missing"
                } else {
                    console.log(`Apply Method: ${method}`)
                    switch (method) {
                        case "RecreateTestDatabase":
                            await recreateTestDatabase()
                            break;
                        case "ResetDatabase":
                            await resetTestDatabase()
                            break;
                        case "MountMinimalDatabase":
                            await resetTestDatabase(joinPath(__dirname, "mockdata", "minimal-filled-database.sql"))
                            break;
                        case "MountMinimalDatabaseWithCreatedType":
                            await resetTestDatabase(joinPath(__dirname, "mockdata", "minimal-filled-database-with-created-type.sql"))
                            break
                        case "MountMinimalDatabaseWithCreatedMint":
                            await resetTestDatabase(joinPath(__dirname, "mockdata", "minimal-db-with-created-mint.sql"))
                            break;
                        default:
                            status = 400
                            message = `Unknown method ${method}`
                    }
                }
            } catch (e) {
                status = 500
                message = e.message
            }

            // After resetting the database, postgres may be not 'ready' 
            // to process the next request. So we wait for a short period of time
            // to let Postgres get acquainted with it's new situation and prevent
            // erros. - Don't ask me why!
            // if (status === 200)
            //     await (() => new Promise(resolve => setTimeout(resolve, 5000)))()
            resetLock = false

        } else {
            status = 423
            message = "Ressource is locked!"
        }

        res.status(status).end(JSON.stringify({ status, message }))
    }

    await start(Object.assign({}, process.env, {
        routes: [
            {
                route: "/test-database",
                handler
            }
        ]
    }))

    await Settings.writeManagedFile()

}



main().then().catch(error)