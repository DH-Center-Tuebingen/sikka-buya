const { Database } = require('../utils/database')

class Nominal {

    static query({
        tableName = "n"
    } = {}) {
        return `
    ${tableName}.id AS nominal_id,
    ${tableName}.name AS nominal_name,
`
    }

    static async get(id, transaction) {
        if (transaction == null)
            transaction = Database
        return transaction.one(`SELECT * FROM nominal WHERE id = $[id]`, { id })
    }
}

module.exports = Nominal