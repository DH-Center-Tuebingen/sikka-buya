const ENV_PREFIX = "BACKUP_"


function include(arr) {
    return (value) => {
        value.toLowerCase()
        return arr.includes(value)
    }
}

function boolean() {
    return (value) => include(["true", "false"])(value)
}

function isAnyString() {
    return (value) => typeof value === "string"
}

const validateOptions = {
    mode: include(["data", "schema", "both", "backend-schema"]),
    owner: boolean(),
    format: include(["custom", "text"]),
    inserts: boolean(),
    out: isAnyString(),
    outAbsolute: isAnyString(),
    name: isAnyString()
}

function showManual() {
    console.log(`
    Usage: node database_backup.js [options]

    Creates a backup of the database based on the configured .env file.
    This script must be run in the 'backend' directory, as it loads the .env file from there.

    The following options can be passed in the command line or be defined inside the .env file.
    Inside the .env file, the options must be prefixed with '${ENV_PREFIX}' e.g. BACKUP_OUT_ABSOLUTE=/path/to/backup


    Options:

    [ ? | --help | -h ]   Shows this manual. 
    [ --mode=? ]                      Backs up the database in the specified mode:
                                     --mode=data: Data only
                                     --mode=schema: Schema only
                                     --mode=both: Both schema and data *Default*
                                     --mode=backend-schema: Updates the schema file located at backend/schema.sql

    [ --owner=? ]                     If set to true, the owner of the database objects will be included in the dump. Default is false.
    [ --format=? ]                    The format of the dump file:
                                     --format=custom: Custom format *Default*
                                     --format=text: Plain text format

    [ --inserts=? ]                   If set to true, the dump will contain INSERT commands to restore the data. Default is false.
    [ --out=? ]                       The directory where the dump file will be saved, relative to the 'backend' directory. Default is the current directory. 
                                      This will override --outAbsolute, if both are present.

    [ --outAbsolute=? ]               The absolute path where the dump file will be saved. Default is the current directory.
    [ --name=? ]                      The name of the dump file. Default is the database name followed by the mode and the current date and time.
    `)
}
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
    return path.join(name)
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

if (args.length == 1) {
    const isHelp = args.length === 1 && (args[0] === "--help" || args[0] === "-h" || args[0] === "?")
    if (isHelp) {
        showManual()
        process.exit(0)
    }
}

const defaultOptions = {
    mode: "both",
    owner: false,
    format: "custom",
    inserts: false,
    out: null,
    outAbsolute: null,
    name: null,
}

let loadedOptions = {}
loadedOptions = loadOptionsFromEnvFile(loadedOptions)
loadedOptions = loadOptionsFromCommandLineArguments(args, loadedOptions)


let options = Object.assign({}, defaultOptions, loadedOptions)

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
        writeFileSync(fileName, txt, { encoding: "utf-8", flag: "w" })
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
    } else if (options.format === "text") {
        ext = "sql"
        options.inserts = true
    } else throw new Error(`Unknown format: ${options.format}`)

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
    } else if (options.outAbsolute) {
        let outputPath = options.outAbsolute
        mkdirSync(outputPath, { recursive: true })
        outputFile = join(outputPath, fileName)
    }
    
    dump(outputFile, additionalOptions.join(" ")).finally(process.exit)
}

function loadOptionsFromEnvFile(loadedOptions) {
    for (let key in process.env) {
        if (key.startsWith(ENV_PREFIX)) {
            let option = key.replace(ENV_PREFIX, "")
            let optionKey = option.split("_").reduce((acc, val) => {
                val = val.toLowerCase()
                if (acc === "") return val
                else {
                    return acc + val.charAt(0).toUpperCase() + val.slice(1)
                }
            }, "")
            const value = process.env[key].trim()
            checkForConflics(loadedOptions, optionKey, value)
            loadedOptions[optionKey] = value
        }
    }
    return loadedOptions
}

function loadOptionsFromCommandLineArguments(args, loadedOptions) {
    args = args.forEach(element => {
        let [key, value] = element.split("=")

        if (key && value) {
            key = key.replace("--", "")
            value = value.trim()
            checkForConflics(loadedOptions, key, value)
            loadedOptions[key] = value
        } else throw new Error(`Argument needs a value: ${element}`)
    });

    return loadedOptions
}

function checkForConflics(options, key, value) {
    if (!defaultOptions.hasOwnProperty(key)) {
        throwUnknownOptionError(key)
    }

    if (options.hasOwnProperty(key)) {
        throwDuplicateOptionError(key)
    }

    if (!validateOptions[key](value)) {
        throw new Error(`Invalid value for ${key}: ${value}`)
    }
}

function throwUnknownOptionError(option) {
    throw new Error(`Unknown option: ${option}`)
}

function throwDuplicateOptionError(option) {
    throw new Error(`Duplicate option: ${option}`)
}