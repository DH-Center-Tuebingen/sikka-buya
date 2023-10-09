/**
 * Creates a backup of the database
 * based on the configured .env file.
 * 
 * Must be run with one of the flags:
 * --mode=data: Backs up all data
 * --mode=schema : Backs up only the structure of the database without the data.
 * --mode=backend-schema: Updates the schema file located at backend/schema.sql
 */

try {
    require("dotenv").config()
} catch (e) {
    console.error("Create an .env file. Check the README.md for required values.")
}

const os = require("os")
const util = require("util")
const exec = util.promisify(require("child_process").exec);

const path = require('path');
const { error, notice } = require('./modules/logging');
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join } = require("path");


function execute(command) {
    return new Promise((resolve, reject) => {
        exec(command).then(({ stdout, stderr }) => {
            if (stdout) console.log(`${stdout}`);
            if (stderr) console.error(`ERROR: ${stderr}`);
            resolve()
        }).catch(reject)
    })
}

function zeroPad(val) {
    return (val).toString().padStart(2, "0")
}

function constructFileName(prefix, ext) {
    let date = new Date()
    const name = `${prefix}_${date.getUTCFullYear()}${zeroPad(date.getUTCMonth() + 1)}${zeroPad(date.getUTCDate())}T${zeroPad(date.getUTCHours())}${zeroPad(date.getUTCMinutes())}${zeroPad(date.getUTCSeconds())}.${ext}`
    return path.join(os.homedir(), name)
}

function dump(fileName, options) {
    return new Promise((resolve, reject) => {
        const command = `pg_dump --username ${process.env.DB_USER} --no-privileges --exclude-table-data app_user --no-password ${options}  --file ${fileName} ${process.env.DB_NAME} `
        execute(command).then(() => {
            console.log(`Successfully exported dump to: ${fileName}`)
            resolve()
        }).catch(err => {
            console.error(`Command encountered errors: ${err}`)
            reject()
        })
    })
}

let args = process.argv.slice(2)
const options = {
    mode: "both",
    owner: false,
    format: "custom",
    inserts: false,
    out: null,
    name: null,
}

args = args.forEach(element => {
    let [key, value] = element.split("=")
    if (key && value) {
        key = key.replace("--", "")
        options[key] = value
    } else throw new Error(`Argument needs a value: ${element}`)
});

let additionalOptions = []

if (options.mode == "backend-schema") {
    fileName = path.join(__dirname, "..", "schema.sql")
    dump(fileName, "--schema-only --no-owner").then(() => {
        let txt = readFileSync(fileName, "utf-8")
        // If the search_path is set to false the database somehow needs a long time to 'readjust' 
        // resulting in the database being not usable for 1-10 minutes which results in tests
        // failing. Removing this line fixes this problem. 
        // 
        // A definite reason, why this happens remains unknown.
        txt = txt.replace("SELECT pg_catalog.set_config('search_path', '', false);", "-- SELECT pg_catalog.set_config('search_path', '', false);")
        writeFileSync(fileName, txt, { encoding: "utf-8", flag: "w"})
        notice("Schema updated correctly!")
    }).catch((err) => {
        error("Failed to update schema", err)
    })
} else {
    let name = (options.mode === "data") ? "data" : (options.mode === "schema") ? "schema" : "both"

    let ext 
    if (options.format === "custom") {
        ext = "dump"
        additionalOptions.push("--format=custom")
    } else if (options.format === "text"){
        ext = "sql"
        options.inserts = true
    }else throw new Error(`Unknown format: ${options.format}`)

    if (!options.owner) {
        additionalOptions.push("--no-owner")
    }

    if (options.mode === "schema")
        additionalOptions.push("--schema-only")
    else if (options.mode === "data")
        additionalOptions.push("--data-only")

    if (options.inserts) {
        additionalOptions.push("--inserts")
    }


    const fileName = (options.name) ? options.name : constructFileName(`${process.env.DB_NAME}_${name}`, ext)
    let outputFile = fileName
    if (options.out) {
        let outDir = join(process.cwd(), options.out)
        mkdirSync(outDir, { recursive: true })
        outputFile = join(outDir, fileName)
    }

    dump(outputFile, additionalOptions.join(" ")).finally(process.exit)
}




