/**
 * Executes all migration files from the 'backend/migrations' folder.
 * 
 * This needs to be run from inside the backend folder and can be
 * alternatively run from within the test folder to apply migrations to
 * test databases.
 */

const { program } = require("commander")
const { readdir, readFile } = require('fs/promises');
const { join } = require('path');
const { WriteableDatabase } = require('../src/utils/database');
const { log, error, notice } = require('./modules/logging');


async function main() {

    program
        .option("--at <number>", "Run the migration with with the number")
        .option("-a, --all", "Runs all migrations")

    program.parse()
    const options = program.opts();

    let errors = []
    try {
        if (options.all) {
            await applyDirectory(migrationsPath, errors)
        } else if (options.at) {
            apply(options.at);
        } else {
            throw new Error("Unknown operation!")
        }

        if (errors.length === 0) return "Applied all migrations successfully!"
        else throw new Error(errors.join("\n\n") + "\n\nProgram exited with errors!")
    } catch (e) {
        console.error("ERROR: " + (e.message ?? e), e)
    }

}

function getMigrationPath(file = "") {
    const pathArray = [__dirname, "..", "migrations"]
    if (file) {
        pathArray.push(file)
    }
    return join(...pathArray);
}

async function getList() {
    return (await readdir(getMigrationPath(), { withFileTypes: true })).filter(dirent => !dirent.isDirectory())
}

async function getMap() {
    return (await getList()).reduce((acc, dirent) => {
        try {
            const id = parseInt(new RegExp("^[0-9]+_").exec(dirent.name))
            if (isNaN(id)) throw new Error("No index found in migration file: " + dirent.name);
            if (acc[id]) throw new Error(`Index (${id}) was found twice for "${dirent.name}"`)
            acc[id] = dirent;
        } catch (e) {
            console.error(e.message ?? e);
        }

        return acc;
    }, {})
}

async function apply(index) {
    const map = await getMap();
    if (!map[index]) {
        throw new Error(`Migration at index "${index}" was not found.`)
    }
    await execute(map[index]);
}

async function execute(dirent) {
    let file = dirent.name
    if (dirent.isDirectory()) throw new Error("Target cannot be a directory: " + file);
    let sql = await readFile(getMigrationPath(file), { encoding: "utf-8" })
    log(`Apply migration ${file} to database ${process.env.DB_NAME}:`)
    notice(sql)
    await WriteableDatabase.any(sql)
}

async function applyDirectory(path, errors = []) {
    console.log("Applying migrations to database " + process.env.DB_NAME)
    const dirents = await getList();
    for (let dirent of dirents) {
        if (dirent.isDirectory()) continue
        await execute(dirent);
    }
}


main().then(log).catch(error)