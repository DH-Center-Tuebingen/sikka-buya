const Resolver = require("../resolver.js")
const { Database, WriteableDatabase } = require("../utils/database.js")
const SQLUtils = require("../utils/sql.js")
const { transformPropertyToSnakeCase } = require("../utils/sql.js")
const Person = require("../models/person.js")

class PersonResolver extends Resolver {

    constructor() {
        super("person")
    }

    async add(_, args) {
        args.data = transformPropertyToSnakeCase(args.data, "shortName")
        args.data = SQLUtils.separateRange(args.data, "reign")

        return WriteableDatabase.tx(async t => {
            const result = await t.one(`
                INSERT INTO person
                    (name, short_name, role, dynasty, reign_from, reign_to)
                VALUES
                    ($[name], $[short_name], $[role], $[dynasty], $[reign_from], $[reign_to])
                RETURNING id
            `, args.data)
            if (result.id && args.data.color != null) {
                const id = result.id
                await t.none(`INSERT INTO person_color (person, color) VALUES ($[person], $[color]) ON CONFLICT (person) DO UPDATE SET color=$[color]`, { person: id, color: args.data.color })
            }
        })
    }

    async update(_, args) {
        if (!args.id)
            throw new Error("Id must be set when updating a value!")

        const id = args.id

        SQLUtils.removeNullProperty(args, "dynasty")
        SQLUtils.removeNullProperty(args, "role")
        args.data = transformPropertyToSnakeCase(args.data, "shortName")
        args.data = SQLUtils.separateRange(args.data, "reign")


        return WriteableDatabase.tx(async t => {
            await t.none(`
                UPDATE person
               SET
                name=$[name], short_name=$[short_name], role=$[role], dynasty=$[dynasty],
                reign_from=$[reign_from], reign_to=$[reign_to]
                WHERE id=$[id]
            `, {
                id, ...args.data
            })


            if (args.data.color != null) {
                await t.none(`
                INSERT INTO person_color (person, color) 
                VALUES ($[person], $[color]) 
                ON CONFLICT (person) 
                DO UPDATE SET color=$[color]`,
                    { person: id, color: args.data.color })
            }
        })
    }

    async get(_, args) {
        let result = await Database.one(`
        SELECT p.id, p.name, p.short_name, 
        p.reign_from, p.reign_to,
        r.id AS role_id, r.name AS role_name,
        d.id AS dynasty_id, d.name AS dynasty_name,
        c.color AS color
        FROM $[table:name] p
        LEFT JOIN person_role r ON p.role = r.id 
        LEFT JOIN dynasty d ON p.dynasty = d.id
        LEFT JOIN person_color c ON c.person = p.id
        WHERE p.id=$[id]
        ORDER BY name ASC
        `, {
            table: this.tableName,
            id: args.id
        })

        return result.map(this.decomposePersonResult)
    }



    async list(_, filters = {}) {

        const whereClauses = []

        let queryParameters = {
            table: this.tableName
        }
        for (let [name, value] of Object.entries(filters)) {
            /**
             * We create a new name that is very unlikely to collide with any other 
             * parameter in the queryParameters.
             * 
             * Object.assign() would have had a too high probability to overwrite 
             * some important queryParameter which may result in severe damages
             * to the database.
             */
            const filterName = "filter_" + name
            queryParameters[filterName] = value
            if (value == null) {
                whereClauses.push(`${name} IS NULL`)
            } else {
                whereClauses.push(`${name}=$[${filterName}]`)
            }
        }


        const where = (whereClauses.length > 0) ? "WHERE " + whereClauses.join("AND") : ""

        let result = await Database.manyOrNone(`
        SELECT p.id, p.name, p.short_name,
        p.reign_from, p.reign_to,
        r.id AS role_id, r.name AS role_name,
        d.id AS dynasty_id, d.name AS dynasty_name,
        c.color AS color
        FROM $[table:name] p
        LEFT JOIN person_role r ON p.role = r.id 
        LEFT JOIN dynasty d ON p.dynasty = d.id
        LEFT JOIN person_color c ON c.person = p.id
        ${where}
        ORDER BY ${SQLUtils.normalizeString("p.name")} ASC`,
            queryParameters)

        result = result.map(this.decomposePersonResult)


        return result
    }

    async search(_, args) {

        let result = await Database.manyOrNone(`
        SELECT p.id, p.name, p.short_name,
        p.reign_from, p.reign_to,
        r.id AS role_id, r.name AS role_name,
        d.id AS dynasty_id, d.name AS dynasty_name,
        c.color AS color
        FROM $[table:name] p
        LEFT JOIN person_role r ON p.role = r.id 
        LEFT JOIN dynasty d ON p.dynasty = d.id
        LEFT JOIN person_color c ON c.person = p.id
        WHERE unaccent(p.name) 
        ILIKE unaccent($[search]) 
        ORDER BY p.reign_from, p.name ASC
        `, {
            table: this.tableName,
            search: `%${args.text}%`
        })

        return result.map(this.decomposePersonResult)
    }

    decomposePersonResult(item) {
        return Person.decomposePersonResult(item)
    }

    async request(query, params = []) {
        return Database.any(query, params)
    }

}

module.exports = PersonResolver