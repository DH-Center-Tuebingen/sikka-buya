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
    let errors = []
    const migrationsPath = join(__dirname, "..", "migrations")
    await applyDirectory(migrationsPath, errors)

    if (errors.length === 0) return "Applied all migrations successfully!"
    else throw new Error(errors.join("\n\n") + "\n\nProgram exited with errors!")
}

async function applyDirectory(path, errors = []) {
    let dirents = await readdir(path, {withFileTypes : true})

    for (let dirent of dirents) {
        if (dirent.isDirectory()) continue
        let file = dirent.name
        try {
            let sql = await readFile(join(path, file), { encoding: "utf-8" })
            log(`Apply migration ${file} to database ${process.env.DB_NAME}:`)
            notice(sql)
            await WriteableDatabase.any(sql)
        } catch (e) {
            errors.push(e)
        }
    }
}


main().then(log).catch(error)