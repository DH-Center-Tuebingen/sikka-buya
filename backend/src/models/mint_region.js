const { Database, WriteableDatabase } = require('../utils/database')
const { GeoJSON } = require('./geojson')
class MintRegion {

    static get tableName() {
        return "mint_region"
    }

    static async get(id, transaction = Database) {
        const list = await this.list({ id }, transaction)
        if (list.length > 1) throw new Error(`More than one mint region with id ${id} found.`)
        return list[0]
    }

    static async list(filters = {}, transaction = Database) {

        let query = `SELECT 
                        id,
                        name,
                        uncertain,
                        ST_AsGeoJSON(location)::json AS location,
                        properties::jsonb AS properties
                    FROM $[tableName:name]`

        if (Object.keys(filters).length > 0) {
            query += `WHERE `
            const filterQuery = Object.keys(filters).map((key) => {
                return `${key} = $[${key}]`
            }).join(" AND ")

            query += filterQuery
        }
        const val = Object.assign({ tableName: MintRegion.tableName }, filters)
        const result = await transaction.manyOrNone(query, val)

        return result.map((row) => MintRegion.postProcess(row))
    }

    static postProcess(result) {
        if (result.properties == null) result.properties = {}
        else if (Object.keys(result.properties).length > 0) {
            let feature = {
                type: "Feature",
                properties: result.properties,
                geometry: result.location
            }
            result.location = feature
        }
        return result
    }

    static async update(id, {
        name,
        location = null,
        uncertain = null
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
        uncertain = false
    } = {}) {
        console.log({ uncertain })
        const { properties, geometry } = GeoJSON.separate(location)

        return WriteableDatabase.query(`INSERT INTO 
        $[tableName:name]
        (name, location, properties, uncertain)
        VALUES
        ($[name], 
            ${location ? "ST_GeomFromGeoJSON($[location])" : null}, 
            ${properties ? "to_jsonb($[properties]::jsonb)" : null},
            $[uncertain])
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
        return Database.manyOrNone(`SELECT * FROM $1:name WHERE unaccent(name) ILIKE unaccent($2)`, [MintRegion.tableName, `%${text}%`])
    }
}

module.exports = MintRegion