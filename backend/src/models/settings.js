const Frontend = require('../frontend')
const { Database, WriteableDatabase } = require('../utils/database')

class Settings {

    static async update(path, value) {

        const errors = []
        if (!path) errors.push("Path is required!")
        if (!value) errors.push("Value is required!")
        if (errors.length) throw new Error(errors.join(" "))


        const pieces = path.split("/")

        //Avoid empty root element
        let name
        do {
            name = pieces.shift()
        } while (!name)

        await WriteableDatabase.tx(async t => {

            let root = await t.oneOrNone(`SELECT * from settings WHERE parent IS NULL and name=$1`, name)
            if (!root) {
                let { id } = await t.one(`INSERT INTO settings (name) VALUES ($[name])  RETURNING id`, { name })
                root = {
                    id,
                    name,
                    parent: null
                }
            }

            let parent = root
            do {
                let name = pieces.shift()
                let element = await t.oneOrNone("SELECT * FROM settings WHERE parent=$[id] AND name=$[name] ", { id: parent.id, name })
                if (!element) {
                    let { id } = await t.one(`INSERT INTO settings (name, parent) VALUES ($[name], $[parent])  RETURNING id`, { name, parent: parent.id })
                    element = {
                        id,
                        name,
                        parent: parent.id
                    }
                }
                parent = element
            } while (pieces.length > 0)

            const { count } = await t.one(`SELECT COUNT(*) as count FROM settings WHERE parent=$[id]`, { id: parent.id })

            if (parseInt(count) > 0) throw new Error("Cannot set value on a non-leaf element!")
            await t.none(`UPDATE settings SET value=$[value] WHERE id=$[id]`, { id: parent.id, value })
        })

        await this.writeManagedFile()
    }

    static async _getListItem(t, parent) {
        if (parent.value) return parent.value
        else {
            const obj = {}
            const results = await t.manyOrNone(`SELECT * FROM settings WHERE parent=$[parent]`, { parent: parent.id })
            for (let result of results) {
                obj[result.name] = await this._getListItem(t, result)
            }
            return obj
        }
    }

    static async _list() {
        let obj = {}
        await WriteableDatabase.tx(async t => {
            const settingGroups = await t.manyOrNone(`SELECT * from settings WHERE parent IS NULL`)

            if (!settingGroups) return obj
            else {
                for (let settings of settingGroups)
                    obj[settings.name] = await this._getListItem(t, settings)
            }
        })
        return obj
    }

    static async list() {
        const obj = await this._list()
        return JSON.stringify(obj)
    }

    static async get(path) {
        let { element } = await this._get(path)
        if (!element) {
            console.error(`Element not found: ${path}`)
            return ""
        }
        else return element.value
    }

    static async _get(path) {
        const pieces = path.split("/")
        let element = null
        let parts = []

        while (pieces.length > 0) {
            //Avoid empty elements
            let name
            do {
                name = pieces.shift()
            } while (!name)

            if (!element) {
                element = await Database.oneOrNone(`SELECT * from settings WHERE parent IS NULL and name=$1`, name)
            } else {
                element = await Database.oneOrNone("SELECT * FROM settings WHERE parent=$[id] AND name=$[name] ", { id: element.id, name })
            }

            parts.push(element)
        }

        return {
            element,
            parts
        }
    }


    static async delete(path) {
        await WriteableDatabase.tx(async t => {

            let { element, parts } = await this._get(path)
            if (!element) throw new Error("Element not found!")

            do {
                let part = parts.pop()
                const refs = await t.oneOrNone(`SELECT count(*) FROM settings WHERE parent=$[id]`, { id: part.id })
                if (parseInt(refs.count) === 0) {
                    await t.none(`DELETE FROM settings WHERE id=$[id]`, { id: part.id })
                }else {
                    await t.none(`UPDATE settings SET value=NULL WHERE id=$[id]`, { id: part.id })
                }
            } while (parts.length > 0)
        })

        await this.writeManagedFile()
    }

    static async writeManagedFile() {
        const file = [
            "// This file is managed by the backend and will be overwritten when settings change.",
            "",
            "window.settings = {}",
            "",
        ]

        const settings = await this._list()

        for (const [name, value] of Object.entries(settings)) {
            file.push(`window.${name} = ${JSON.stringify(value, null, 4)}`)
            file.push("")
        }

        await Frontend.writeFile(file.join("\n"), "config.managed.js")
        console.log(`Managed Settings file was written to: ${Frontend.getByParts("config.managed.js")}`)
    }

    static async writeManagedFileIfNecessary() {
        const managed = Frontend.getByParts("config.managed.js")
        try {
            await access(managed)
        } catch {
            await this.writeManagedFile()
        }
    }
}

module.exports = Settings