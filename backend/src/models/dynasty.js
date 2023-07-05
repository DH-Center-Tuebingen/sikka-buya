const { Database } = require('../utils/database');

class Dynasty {


    static async get(id) {
        return Database.one(`SELECT * FROM dynasty WHERE id = $[id]`, { id })
    }
}

module.exports = Dynasty