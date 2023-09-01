const { Database, WriteableDatabase } = require('../utils/database')
const { GeoJSON } = require('./geojson')
class MintRegion {

    static get tableName() {
        return "mint_region"
    }

    static async get(id) {
        const res = await Database.oneOrNone(`
        SELECT
            id,
            name,
            ST_AsGeoJSON(location)::json AS location
        FROM $1:name WHERE id=$2
        `, [MintRegion.tableName, id])
        return res

    }

    static async list() {
        return Database.manyOrNone(`
            SELECT 
                id,
                name,
                ST_AsGeoJSON(location)::json AS location
            FROM $1:name`, [MintRegion.tableName])
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
            tableName: MintRegion.tableName,
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


        console.log("location", location)

        return WriteableDatabase.query(`INSERT INTO 
        $[tableName:name]
        (name, location, uncertain)
        VALUES
        ($[name], 
            ${location ? "ST_GeomFromGeoJSON($[location])" : null}, 
            $[uncertain])
        `, {
            tableName: MintRegion.tableName,
            name,
            location,
            uncertain
        })
    }

    static async delete(id) {
        return WriteableDatabase.query(`DELETE FROM $[tableName:name] WHERE id=$[id]`, {
            tableName: MintRegion.tableName,
            id
        })
    }

    static async search(text) {
        return Database.manyOrNone(`SELECT * FROM $1:name WHERE unaccent(name) ILIKE unaccent($2)`, [MintRegion.tableName, `%${text}%`])
    }
}

module.exports = MintRegion