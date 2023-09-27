const { Database, WriteableDatabase } = require('../utils/database')
const { GeoJSON } = require('./geojson')
class MintRegion {

    static get tableName() {
        return "mint_region"
    }

    static get selectQuery() {
        return `SELECT 
                    id,
                    name,
                    uncertain,
                    ST_AsGeoJSON(location)::json AS location,
                    properties::jsonb AS properties
                FROM mint_region
                `
    }

    static async get(id, transaction = Database) {
        const list = await this.list({ id }, transaction)
        if (list.length > 1) throw new Error(`More than one mint region with id ${id} found.`)
        return list[0]
    }

    static async list(filters = {}, transaction = Database) {

        let query = MintRegion.selectQuery

        if (Object.keys(filters).length > 0) {
            query += `WHERE `
            const filterQuery = Object.keys(filters).map((key) => {
                return `${key} = $[${key}]`
            }).join(" AND ")

            query += filterQuery
        }

        query += ` ORDER BY unaccent(name)`
        const result = await transaction.manyOrNone(query, filters)
        return result.map((row) => MintRegion.postProcess(row))
    }

    static postProcess(row) {
        if (row.properties == null) row.properties = {}
        row.location = GeoJSON.rebuild(row.location, row.properties)
        return row
    }

    static async update(id, {
        name,
        location = null,
        uncertain = null,
    } = {}) {

        const { properties, geometry } = GeoJSON.separate(location)

        return WriteableDatabase.query(`UPDATE
        $[tableName:name]
            SET 
        name = COALESCE($[name], name),
        location = COALESCE(ST_GeomFromGeoJSON($[location]), location),
        uncertain = COALESCE($[uncertain], uncertain),
        properties = COALESCE(to_jsonb($[properties]::jsonb), properties)
        WHERE id=$[id]
        `, {
            id,
            tableName: MintRegion.tableName,
            name,
            location: geometry,
            uncertain,
            properties: JSON.stringify(properties)
        })
    }

    static async add({
        name,
        location = null,
        uncertain = false,
    } = {}) {
        const { properties, geometry } = GeoJSON.separate(location)

        return WriteableDatabase.query(`INSERT INTO 
        $[tableName:name]
        (name, location, properties, uncertain)
        VALUES
        ($[name], 
            ${location ? "ST_GeomFromGeoJSON($[location])" : null}, 
            ${properties ? "to_jsonb($[properties]::jsonb)" : null},
            $[uncertain]
            )
        `, {
            tableName: MintRegion.tableName,
            name,
            location: geometry,
            uncertain,
            properties: JSON.stringify(properties)
        })
    }

    static async delete(id) {
        return WriteableDatabase.query(`DELETE FROM $[tableName:name] WHERE id=$[id]`, {
            tableName: MintRegion.tableName,
            id
        })
    }

    static async search(text) {
        let query = MintRegion.selectQuery
        const result = await Database.manyOrNone(query + `WHERE unaccent(name) ILIKE unaccent($[text])`, {
            text: `%${text}%`
        })

        return result.map((row) => MintRegion.postProcess(row))
    }
}

module.exports = MintRegion