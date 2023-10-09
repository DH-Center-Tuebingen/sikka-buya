const { resetTestDatabase, recreateTestDatabase } = require('./tasks/setup.js')
const { join: joinPath } = require("path");
const start = require('../backend/express.js');
const { error } = require('../backend/scripts/modules/logging.js');
const Settings = require('../backend/src/models/settings.js');
const { readFile, writeFile } = require('fs/promises');
const promisify = require('node:util').promisify;
const exec = promisify(require('child_process').exec);

async function run(command, options = {}) {
    const { stdout, stderr } = await exec(command, options)
    console.log(stdout)
    console.error(stderr)
}

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
        let file = null

        if (!resetLock) {
            resetLock = true

            res.setHeader('Content-Type', 'application/json');

            try {
                const { method, migrate = false, save = false } = req.body
                console.log(req.body, method, migrate, save)
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
                            file = joinPath(__dirname, "mockdata", "minimal-filled-database.sql")
                            break;
                        case "MountMinimalDatabaseWithCreatedType":
                            file = joinPath(__dirname, "mockdata", "minimal-filled-database-with-created-type.sql")
                            break
                        case "MountMinimalDatabaseWithCreatedMint":
                            file = joinPath(__dirname, "mockdata", "minimal-db-with-created-mint.sql")
                            break;
                        default:
                            status = 400
                            message = `Unknown method ${method}`
                    }

                    if (status === 200 && method != "RecreateTestDatabase") {
                        await resetTestDatabase(file)
                        message = "Suceessfully reset database"

                        if (migrate) {
                            console.log(`Migrate Database`)
                            await run("npm run utils:migrate")
                            message += "\nSuceessfully migrated database"
                        }

                        if (save && file) {
                            console.log(`Save file: ${file} .............`)
                            run(`pg_dump --no-privileges --no-owner --no-password --inserts -U ${process.env.DB_USER} --file ${file} ${process.env.DB_NAME}`)

                            let txt = await readFile(file, { encoding: "utf-8" })
                            // If the search_path is set to false the database somehow needs a long time to 'readjust' 
                            // resulting in the database being not usable for 1-10 minutes which results in tests
                            // failing. Removing this line fixes this problem. 
                            // 
                            // A definite reason, why this happens remains unknown.
                            txt = txt.replace("SELECT pg_catalog.set_config('search_path', '', false);", "-- SELECT pg_catalog.set_config('search_path', '', false);")
                            await writeFile(file, txt, { encoding: "utf-8", flag: "w" })
                            message += "\nSuceessfully saved file"
                        }
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

        console.log(`Status: ${status} - Message: ${message}`)
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