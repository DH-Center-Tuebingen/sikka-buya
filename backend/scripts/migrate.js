/**
 * Executes all migration files from the 'backend/migrations' folder.
 * 
 * This needs to be run from inside the backend folder and can be
 * alternatively run from within the test folder to apply migrations to
 * test databases.
 */

const { readdir, readFile } = require('fs/promises');
const { join } = require('path');
const { WriteableDatabase } = require('../src/utils/database');
const { log, error, notice } = require('./modules/logging');


async function main() {
    console.log("Applying migrations to database " + process.env.DB_NAME)
    const migrationsPath = join(__dirname, "..", "migrations")
    let dir = await readdir(migrationsPath)
    let errors = []

    for (let file of dir) {
        try {
            let sql = await readFile(join(migrationsPath, file), { encoding: "utf-8" })
            log(`Apply migration ${file} to database ${process.env.DB_NAME}:`)
            notice(sql)
            await WriteableDatabase.any(sql)
        } catch (e) {
            errors.push(e)
        }
    }

    if (errors.length === 0) return "Applied all migrations successfully!"
    else throw new Error(errors.join("\n\n") + "\n\nProgram exited with errors!")
}


main().then(log).catch(error)