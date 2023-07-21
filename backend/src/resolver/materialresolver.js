
const { WriteableDatabase, Database, pgp } = require('../utils/database')
const BaseResolver = require("./base-resolver")

class MaterialResolver extends BaseResolver {
    constructor() {
        super("material")
    }

    async add(_, args, tableName) {
        super.argumentGuard("name", args)

        return WriteableDatabase.tx(async t => {
            const { id } = await t.one("INSERT INTO material (name) VALUES ($1)  RETURNING id;", args.name)
            console.log(args)
            if (args.color)
                await t.none("INSERT INTO material_color (material, color) VALUES ($1, $2)", [id, args.color])

            return id
        })
    }

    async update(_, args) {
        super.argumentGuard("id", args)

        return WriteableDatabase.tx(t => {
            if (args.name) {
                t.none(`UPDATE material SET name=$[name] WHERE id=$[id]`, args)
            }
            if (args.color) {
                t.none(`
                INSERT INTO material_color (material, color) VALUES ($[id], $[color]) ON CONFLICT (material) DO UPDATE SET color=$[color]
                `, args)
            }
        })
    }

    async delete(_, args) {
        super.argumentGuard("id", args)
        return WriteableDatabase.none("DELETE FROM material WHERE id=$1", args.id)
    }

    createListQuery() {
        return pgp.as.format(`SELECT *, material_color.color AS color FROM material 
        LEFT JOIN material_color ON material_color.material = material.id
        `)
    }

    async get(_, args) {
        super.argumentGuard("id", args)
        return Database.oneOrNone(`
        ${this.createListQuery()}
        WHERE id=$1
        `, args.id)
    }

    async search(_, { text } = {}) {
        return Database.manyOrNone(`
        ${this.createListQuery()}
        WHERE unaccent(material.name) ILIKE unaccent($1)
        `, [`%${text}%`])
    }

    async list(_, { language } = {}) {
        const query = `${this.createListQuery()} ORDER BY material.name`
        return Database.manyOrNone(query)
    }
}

module.exports = MaterialResolver