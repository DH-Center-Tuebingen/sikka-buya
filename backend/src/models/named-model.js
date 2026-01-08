const { Database, WriteableDatabase } = require("../utils/database");
const Model = require("./model");

class NamedModel extends Model {
    constructor(tableName, supportsTimestamps = false) {
        super(tableName)
        this.supportsTimestamps = supportsTimestamps
    }

    get tableName() {
        return this._tableName
    }

    get capitalizedName() {
        return this.tableName.charAt(0).toUpperCase() + this.tableName.slice(1);
    }

    async list(transaction = Database) {
        console.log(`Listing all from table ${this.tableName}`);
        return transaction.manyOrNone(`SELECT id, name FROM ${this.tableName} ORDER BY name ASC`)
    }

    async get(id, transaction = Database) {
        return transaction.oneOrNone(`SELECT id, name FROM ${this.tableName} WHERE id = $1`, [id])
    }

    async search(text = "", transaction = Database) {
        return transaction.manyOrNone(`SELECT id, name FROM ${this.tableName} WHERE unaccent(name) ILIKE unaccent($1)`, [`%${text}%`])
    }

    async add(name, transaction = WriteableDatabase) {
        if (this.supportsTimestamps) {
            return transaction.one(`INSERT INTO ${this.tableName} (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id`, [name])
        } else {
            return transaction.one(`INSERT INTO ${this.tableName} (name) VALUES ($1) RETURNING id`, [name])
        }
    }

    async update(id, name, transaction = WriteableDatabase) {
        if (this.supportsTimestamps) {
            return transaction.none(`UPDATE ${this.tableName} SET name = $1, updated_at = NOW() WHERE id = $2`, [name, id])
        } else {
            return transaction.none(`UPDATE ${this.tableName} SET name = $1 WHERE id = $2`, [name, id])
        }   
    }

    async delete(id, transaction = WriteableDatabase) {
        return transaction.none(`DELETE FROM ${this.tableName} WHERE id = $1`, [id])
    }
}

module.exports = NamedModel;