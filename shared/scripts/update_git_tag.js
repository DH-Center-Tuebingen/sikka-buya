const { exec } = require('child_process')
let { join } = require("path")
const packageJsonPath = join(__dirname, "..", "..", "package.json")
const { log, error } = require("../../backend/scripts/modules/logging.js")

async function main() {
    console.log(`Retrieving tag ...`)
    const tag = getTag()
    console.log(`Add tag '${tag}' to repo.`)
    await addTag(tag)
    console.log(`Push tag to remote ...`)
    await pushTag()
    console.log(`Successfully pushed tag '${$tag}' to remote!`)
}

function getTag() {
    let packageJson = require(packageJsonPath)
    if (!packageJson.version) throw new Error(`Invalid 'package.json' which had no version value: ${packageJsonPath}`)
    return "v." + packageJson.version
}

async function addTag(version) {
    return new Promise((resolve, reject) => {
        let errors = []
        exec(`git tag ${version}`, (err, stdout, stderr) => {
            if (stderr)
                errors.push(stderr)

            if (stdout)
                log(`${stdout}`);

            if (errors.length === 0) {
                resolve()
            } else (
                reject(`Could not add tag: ${errors.join("\n\n")}`)
            )
        });
    })
}

function pushTag() {
    return new Promise((resolve, reject) => {
        exec(`git push --tags`, (err, stdout, stderr) => {

            if (err) {
                reject(`Could not push tag: ${err}`)
            } else resolve(stderr)


        });
    })
}

main().then(log).catch(error)