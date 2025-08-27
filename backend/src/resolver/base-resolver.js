const Auth = require('../auth')
const { Database } = require('../utils/database')
const { guardFunctionObject } = require("../utils/guard.js")



//Abstract resolver base class
class BaseResolver {

    /*
     * Abstract functions that need to be implemented
     */
    async add(_, args, tableName) {
        throw new Error("Add is not implemented!")
    }

    async update(_, args) {
        throw new Error("Update is not implemented!")
    }

    async delete(_, args) {
        throw new Error("Delete is not implemented!")
    }

    async get(_, args) {
        throw new Error("Get is not implemented!")
    }

    async list(_, { language } = {}) {
        throw new Error("List is not implemented!")
    }

    updateListByObject(obj) {
        return pgp.as.format(Object.keys(obj).map((val, idx) => `${val}=$${idx + 2}`), obj)
    }

    argumentGuard(name, args) {
        if (!args[name]) throw new Error(`The parameter ${name} is required.`)
    }

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
        let mutations = {}
        mutations[`add${this.capitalizedName}`] = function (_, args, context) {
            return ref.add(_, args, ref.tableName)
        }
        mutations[`update${this.capitalizedName}`] = function (_, args, context) {
            return ref.update(_, args, ref.tableName)
        }
        mutations[`delete${this.capitalizedName}`] = function (_, args, context) {
            return ref.delete(_, args, ref.tableName)
        }
        // Only super and editors can edit resolvers.
        resolvers.Mutation = guardFunctionObject(mutations, async (_, __, context) => await Auth.requirePermission(context, 'editor'))

        resolvers.Query[`${this.name}`] = function (_, args, context) { return ref.list(_, args, context, ref.tableName) }
        resolvers.Query[`get${this.capitalizedName}`] = function (_, args, context) { return ref.get(_, args, context, ref.tableName) }
        resolvers.Query[`search${this.capitalizedName}`] = function (_, args, context) { return ref.search(_, args, context, ref.tableName) }
        return resolvers
    }

    async search(_, args) {
        return Database.any(`SELECT * FROM ${this.tableName} WHERE unaccent(name) ILIKE unaccent($1) ORDER BY name ASC LIMIT ${process.env.MAX_SEARCH}`, `%${args.text}%`)
    }

    async request(query, params = []) {
        return Database.any(query, params)
    }
}


module.exports = BaseResolver