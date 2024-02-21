require("dotenv").config()
const { DB_FIELDS, ALLOWED_STYLES } = require("../constants/html_formatted_fields");
const { Database, pgp } = require("../src/utils/database");
const HTMLSanitizer = require("../src/utils/HTMLSanitizer");
const fs = require("fs")
const path = require("path")

async function main() {

    /**
     * Create first. If it fails for some reason, the execution is stop.
     * Preventing changes on the database without tracking changes.
     */
    const outpath = path.join(__dirname, "out")
    if (!fs.existsSync(outpath)) {
        fs.mkdirSync(outpath)
    }

    const changesOverview = []
    const details = []


    const limit = 10
    let offset = 0

    const idColumns = [
        "id",
        "project_id",
    ]

    let results
    do {
        results = await Database.manyOrNone(`
    SELECT ${[...idColumns, ...DB_FIELDS].join(", ")} from type
    LIMIT $[limit]
    OFFSET $[offset]
`, { limit, offset })

        offset += limit

        for (let result of Object.values(results)) {
            updateData = {}

            const base = {
                id: result.id,
                name: result.project_id,
                fields: {}
            }

            let overviewEntry = Object.assign({}, base)
            let detailsEntry = Object.assign({}, base)

            for (let col of Object.values(DB_FIELDS)) {
                let field = result[col]
                let updated = HTMLSanitizer.sanitize(field, ...ALLOWED_STYLES)
                updated = removeComments(updated)

                if (field != updated) {
                    updateData[col] = updated
                    detailsEntry.fields[col] = {
                        old: field,
                        new: updated
                    }
                }
            }

            if (Object.keys(updateData).length > 0) {
                let query = pgp.helpers.update(updateData, Object.keys(updateData), "type")
                await Database.none(query + " WHERE id=$1", result.id)
            }

            if (overviewEntry.fields.length > 0)
                changesOverview.push(overviewEntry)

            if (Object.values(detailsEntry.fields).length > 0) {
                details.push(detailsEntry)
            }
        }
    } while (results && results.length > 0)


    changesOverview.sort((a, b) => {
        return a.name < b.name
    })
    details.sort((a, b) => {
        return a.name < b.name
    })

    fs.writeFileSync(path.join(outpath, "änderungen_überblick.json"), JSON.stringify(changesOverview))
    fs.writeFileSync(path.join(outpath, "änderungen_detail.json"), JSON.stringify(details))


}


function removeComments(el) {
    return el.replace(/(<!.+?-->)/gs, "")
}


main().catch(console.error)