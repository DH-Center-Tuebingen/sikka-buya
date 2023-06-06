/**
 * Increments or sets the version number for all repositories.
 * By default increments the minor version by 1.
 * 
 * @params [--version, -v]  -    Sets the specified version directly. NOTE: Use quotes to wrap the version number.
 * 
 * @author Severin Opel
 * @year 2022
 */

const { readFile } = require('fs').promises;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { writeFile } = require('fs/promises');
const { join } = require("path");



async function main() {


    const args = process.argv.slice(2)
    let mode = "increment-minor"
    let version = null

    if (args.length > 0) {
        const [key, val] = args[0].split("=")
        if (key === "-v" || key === "--version") {
            version = val.split(".")
            mode = "set"
        }
    }

    const relativeRoot = join("..", "..")
    const targetFile = "package.json"
    const locations = ["frontend", "backend"]
    let masterLocation = "."

    switch (mode) {
        case "set": break;
        case "increment-minor":
            version = await getVersion(join(__dirname, relativeRoot, targetFile))
            version[2]++
            break;
        default:
            throw new Error("Unsupported mode selected!")
    }

    version = version.join(".")

    for (let location of [masterLocation, ...locations]) {
        const file = join(__dirname, relativeRoot, location, targetFile)
        const packageJson = await getPackageJson(file)
        packageJson.version = version
        console.log(`Updated file "${file}" to version ${version}.`)
        await writeFile(file, JSON.stringify(packageJson, null, 4))
    }

    await execute(`git add ${join(__dirname, relativeRoot)}`)
    await execute(`git commit -m "Upgraded version to ${version}."`)
    await execute(`git push`)
    await execute(`node ${join(__dirname, "update_git_tag.js")}`)
}

async function execute(command) {
    console.log(`Executing: ${command}`)
    await exec(command)
}

async function getPackageJson(file) {

    let content
    try {
        content = await readFile(file)
    } catch (e) {
        console.log(`Invalid file: ${file}`, e)
    }

    try {
        const packageJson = JSON.parse(content)
        return packageJson
    } catch (e) {
        throw new Error("A 'package.json' file was invalid JSON: " + file, e)
    }
}

async function getVersion(file) {
    const packageJson = await getPackageJson(file)
    const version = packageJson.version
    return version.split(".").map(num => parseInt(num))
}


main()
    .then(() => {
        console.log("Program finished correcty.")
    }).catch(console.error)

