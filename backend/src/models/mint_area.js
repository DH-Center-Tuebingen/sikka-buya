const { Database, WriteableDatabase } = require('../utils/database')
const { GeoJSON } = require('./geojson')
class MintArea {

    static get tableName() {
        return "mint_area"
    }

    static async get(id) {
        return Database.oneOrNone(`SELECT * FROM $1:name WHERE id=$2`, [MintArea.tableName, id])

    }

    static async list() {
        return Database.manyOrNone(`SELECT * FROM $1:name`, [MintArea.tableName])
    }

    static async update(id, {
        name,
        location = null,
        uncertain = null
    } = {}) {
        return WriteableDatabase.query(`UPDATE
        $[tableName:name]
            SET 
        name = COALESCE($[name], name),
        location = COALESCE(ST_GeomFromGeoJSON($[location]), location),
        uncertain = COALESCE($[uncertain], uncertain)
        `, {
            tableName: MintArea.tableName,
            name,
            location,
            uncertain
        })
    }

    static async add({
        name,
        location = null,
        uncertain = false
    } = {}) {
        return WriteableDatabase.query(`INSERT INTO 
        $[tableName:name]
        (name, location, uncertain)
        VALUES
        ($[name], 
            ${location ? "ST_GeomFromGeoJSON($[location])" : null}, 
            $[uncertain])
        `, {
            tableName: MintArea.tableName,
            name,
            location,
            uncertain
        })
    }

    static async delete(id) {
        return WriteableDatabase.query(`DELETE FROM $[tableName:name] WHERE id=$[id]`, {
            tableName: MintArea.tableName,
            id
        })
    }

    static async search(text) {
        return Database.manyOrNone(`SELECT * FROM $1:name WHERE unaccent(name) ILIKE unaccent($2)`, [MintArea.tableName, `%${text}%`])
    }
}

module.exports = MintArea