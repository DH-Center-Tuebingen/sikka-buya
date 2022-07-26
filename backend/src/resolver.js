const Auth = require("./auth.js")
const { Database, pgp } = require("./utils/database.js")

class Resolver {

    constructor(name, { tableName = null } = {}) {
        this.name = name
        this.tableName = tableName ? tableName : this.name
    }

    get capitalizedName() {
        return this.name[0].toUpperCase() + this.name.substr(1)
    }

    get resolvers() {
        const resolvers = {
            Query: {},
            Mutation: {}
        }

        const ref = this
        resolvers.Mutation[`add${this.capitalizedName}`] = function (_, args, context) {
            Auth.verifyContext(context)
            return ref.add(_, args, ref.tableName)
        }
        resolvers.Mutation[`update${this.capitalizedName}`] = function (_, args, context) {
            Auth.verifyContext(context)
            return ref.update(_, args, ref.tableName)
        }
        resolvers.Mutation[`delete${this.capitalizedName}`] = function (_, args, context) {
            Auth.verifyContext(context)
            return ref.delete(_, args, ref.tableName)
        }

        resolvers.Query[`${this.name}`] = function (_, args, context) { return ref.list(_, args, context, ref.tableName) }
        resolvers.Query[`get${this.capitalizedName}`] = function (_, args, context) { return ref.get(_, args, context, ref.tableName) }
        resolvers.Query[`search${this.capitalizedName}`] = function (_, args, context) { return ref.search(_, args, context, ref.tableName) }
        return resolvers
    }

    async add(_, args, tableName) {
        return Database.none(`INSERT INTO ${tableName} (${Object.keys(args).join(",")}) VALUES (${Object.keys(args).map((name) => `$[${name}]`)})`, args)
    }

    async update(_, args) {
        const id = args.id
        if (!id || id <= 0) throw new Error("error.invalid_id")
        delete args.id
        const query = `UPDATE ${this.tableName} SET ${Object.keys(args).map((val, idx) => `${val}=$${idx + 2}`)} WHERE id=$1`
        return Database.none(query, [id, ...Object.values(args)])
    }

    async delete(_, args) {
        return Database.none(`DELETE FROM ${this.tableName} WHERE id=$1`, [args.id])
    }

    async get(_, args) {
        return Database.one(`SELECT * FROM ${this.tableName} WHERE id=$1 `, [args.id])
    }

    async list(_, { language } = {}) {
        if (language && language.length < 4 && language != "de") {
            let langTable = `${this.tableName}_${language}`
            return Database.manyOrNone(`
            SELECT a.id, 
            CASE WHEN b.name IS NOT NULL THEN b.name ELSE a.name END
            FROM ${this.tableName} a
            LEFT JOIN ${langTable} b ON a.id= b.id
            ORDER BY a.name ASC
            `)

        } else
            return Database.manyOrNone(`SELECT * FROM ${this.tableName} ORDER BY ${this.tableName}.name ASC`)
    }

    async search(_, args) {
        return Database.any(`SELECT * FROM ${this.tableName} WHERE unaccent(name) ILIKE unaccent($1) ORDER BY name ASC LIMIT ${process.env.MAX_SEARCH}`, `%${args.text}%`)
    }
}


module.exports = Resolver