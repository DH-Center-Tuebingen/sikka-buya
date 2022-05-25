const { resetTestDatabase } = require('./tasks/setup.js')
const { join: joinPath } = require("path");
const start = require('../backend/express.js');

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

    verifyAllEnvVariablesAreSet()


    process.env.expressPort = 4000
    process.env.jwtSecret = "secret"


    async function handler(req, res, next) {
        res.setHeader('Content-Type', 'application/json');

        let status = 200
        let message = ""
        try {
            const { method } = req.body
            if (!method) {
                status = 400
                message = "Parameter 'method' missing"
            } else {
                switch (method) {
                    case "ResetDatabase":
                        await resetTestDatabase()
                        break;
                    case "MountMinimalDatabase":
                        await resetTestDatabase(joinPath(__dirname, "mockdata", "minimal-filled-database.sql"))
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

}



main().then().catch(console.error)