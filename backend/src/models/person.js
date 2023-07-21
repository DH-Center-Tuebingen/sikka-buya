const { Database } = require('../utils/database')
const { transformPropertyToCamelCase, objectifyBulk } = require('../utils/sql')


class Person {

    static async addPersonColor(person, color, t = null) {
        if (!t) t = Database
        t.query(`INSERT INTO person_color (person, color) VALUES ($[person], $[color])`, { person, color })
    }

    static async get(t = Database, id) {
        let result = await t.one(`
        SELECT p.id, p.name, p.short_name,
        r.id AS role_id, r.name AS role_name,
        d.id AS dynasty_id, d.name AS dynasty_name,
        c.color AS color
        FROM person p
        LEFT JOIN person_role r ON p.role = r.id
        LEFT JOIN dynasty d ON p.dynasty = d.id
        LEFT JOIN person_color c ON c.person = p.id
        WHERE p.id=$[id]
        ORDER BY name ASC
        `, {
            id: id
        })

        return this.decomposePersonResult(result)
    }

    static decomposePersonResult(result) {
        result = objectifyBulk(result, this.objectifyConfigs)
        result = transformPropertyToCamelCase(result, "short_name")
        return result
    }

    static get objectifyConfigs() {
        return [this.roleObjectifyConfig, this.dynastyObjectyifyConfig]
    }


    static get dynastyObjectyifyConfig() {
        return {
            prefix: "dynasty_",
            target: "dynasty",
            keys: ["id", "name"]
        }
    }

    static get roleObjectifyConfig() {
        return {
            prefix: "role_",
            target: "role",
            keys: ["id", "name"]
        }
    }
}

module.exports = Person