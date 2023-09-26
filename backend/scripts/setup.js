/**
 * This script requires psql to work with the 
 * '--no-password' flag. You may use the 
 * 'generate_pgpass' script.
 * 
 * It's explained here how to set it up:
 * https://www.postgresql.org/docs/current/libpq-pgpass.html
 */

try {
    require("dotenv").config()
} catch (e) {
    Message.error("Create an .env file. Check the README.md for required values.")
}

const { pgp } = require("../src/utils/database")
const { createReadOnlyUser } = require("./create_read_only_user")

const path = require('path');
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});
const { promisify } = require('util');
const Message = require('./modules/logging');
const chalk = require('chalk');
const question = promisify(readline.question).bind(readline)
const exec = promisify(require("child_process").exec);

async function databaseExists(db) {
    let result = await db.query(`SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower($1);`, [process.env.DB_NAME])
    return result.length !== 0
}

async function createDatabase(db) {
    return new Promise((resolve, reject) => {
        db.result("CREATE Database $1:name OWNER $2:name", [process.env.DB_NAME, process.env.DB_USER]).then(() => {
            Message.success(`Database '${process.env.DB_NAME}' was created successfully....`)
            resolve(true)
        }).catch((error) => {
            Message.error(error)
            reject(error)
        })
    })
}

async function applySchema() {
    const schemaFilePath = path.join(__dirname, "..", "schema.sql")
    Message.notice(`\nApplying schema file ${schemaFilePath} ...`)

    try {
        const child_process = await exec(`psql --no-password -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${schemaFilePath}`)
        await Settings.writeManagedFile()

        if (child_process.stdout)
            Message.log(`stdout: ${child_process.stdout}`);
        if (child_process.stderr)
            Message.warn(`stderr: ${child_process.stderr}`);

        if (child_process.stderr)
            Message.warn(`Schema was applied. You may find problems and errors above.`)
        else
            Message.success(`Scheme was applied without any errors!`)
    } catch (e) {
        Message.error(e);
    }
}

async function userExists(db, name) {
    const result = await db.result(`SELECT 1 FROM pg_roles WHERE rolname=$[name]`, { name })
    return result.rows.length > 0
}

async function createSuperUser(db) {
    await db.none(`CREATE USER $[user:name] SUPERUSER PASSWORD $[password]`, { user: process.env.DB_USER, password: process.env.DB_PASSWORD })
}

; (async function () {
    const super_pw = await question(chalk.bold.yellow(`
!!! WARNING !!!
This script will create a new DATABASE and a SUPERUSER as specified in your .env file!
If you are sure that you want to proceed insert your 
postgres admin password (the password of the user 'postgres'):\n`))

    let root_db = pgp({
        user: "postgres",
        host: process.env.DB_HOST,
        database: "postgres",
        password: super_pw,
        port: process.env.DB_PORT
    })


    try {

        if (await userExists(root_db, process.env.DB_USER)) {
            Message.warn(`User ${process.env.DB_USER} already exists.`)
        } else {
            Message.notice(`Creating user '${process.env.DB_USER}' ...`)
            await createSuperUser(root_db)
        }

        if (await userExists(root_db, process.env.DB_READ_ONLY_USER)) {
            Message.warn(`The read-only user '${process.env.DB_READ_ONLY_USER}' already exists. If your permissions and credentials do fit, you can ignore this warning.`)
        } else {
            Message.notice(`Creating user '${process.env.DB_READ_ONLY_USER}' ...`)
            await createReadOnlyUser()
        }

        if (await databaseExists(root_db)) {
            Message.warn(`Database '${process.env.DB_NAME}' already exists.`)
        } else {
            Message.notice(`Creating '${process.env.DB_NAME}' ...`)
            await createDatabase(root_db)
        }

        await applySchema()

        Message.notice(`Setup script finished successfully.`)
    } catch (e) {
        Message.error(`Setup exited with errors: ${e}`)
    }



    process.exit()
}())


