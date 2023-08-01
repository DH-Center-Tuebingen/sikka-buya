

const { writeFileSync } = require("node:fs")
const https = require("node:https")
const path = require("node:path")
require("dotenv").config()

async function main() {

    if (!process.env.PRODUCTION_URI) {
        throw new Error("No production URI found in .env file")
    }


    https.get(`${process.env.PRODUCTION_URI}/graphql?query={i18n}`, (res) => {

        let body = ""

        res.setEncoding("utf8")
        res.on("data", (chunk) => {
            body += chunk
        })

        res.on("end", () => {
            const lang = JSON.parse(body)
            const i18n = JSON.parse(lang.data.i18n)

            for (let [lang, langObj] of Object.entries(i18n)) {
                const file = path.join(__dirname, `../data/lang/${lang}.json`)
                writeFileSync(file, JSON.stringify(langObj, null, 4))
            }
        })
    })
}


main().then(console.log).catch(console.error)
