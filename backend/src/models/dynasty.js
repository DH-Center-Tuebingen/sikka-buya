const { Database } = require('../utils/database');

class Dynasty {


    static async get(id, transaction) {
        if (transaction == null)
            transaction = Database

        return transaction.one(`SELECT * FROM dynasty WHERE id = $[id]`, { id })
    }
}

module.exports = Dynasty