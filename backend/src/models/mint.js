const { Database, WriteableDatabase } = require("../utils/database.js")
const SQLUtils = require('../utils/sql.js')
const { GeoJSON } = require("../models/geojson")

class Mint {

    static async add(mint) {
        this.fixGeoJSON(mint)

        mint = Object.assign({
            name: null,
            location: null,
            uncertain: null,
            uncertain_area: null,
            province: null,
        }, mint)

        const query = `
        INSERT INTO mint (name,
            location,
            uncertain,
            uncertain_area,
            province
            )  
        VALUES
        (
            $[name],
            ${mint.location ? "ST_GeomFromGeoJSON($[location])" : null} ,
            $[uncertain],
            ${mint.uncertain_area ? "ST_GeomFromGeoJSON($[uncertain_area])" : null} ,
            $[province]
        )
        RETURNING id;`
        let result = await WriteableDatabase.one(query, mint)
        return result.id
    }


    static async update(id, mint) {
        this.fixGeoJSON(mint)

        let keys = Object.keys(mint)
        if (keys.length === 0) throw new Error("At least 1 column needs to be updated!")

        const sets = []
        for (let key of keys) {
            if (key === "location" || key === "uncertain_area") {
                let set = `${key} = ${mint[key] ? `ST_GeomFromGeoJSON($[${key}])` : null}`
                sets.push(set)
            } else
                sets.push(`${key} = $[${key}]`)
        }

        const query = `UPDATE mint SET ${sets.join(", ")} WHERE id = $[id]`
        await WriteableDatabase.none(query, Object.assign({}, mint, { id }))
        return id
    }

    static async search(text) {
        if (text == '' || text) {
            let p = await Database.manyOrNone(`
        SELECT 
            ${this.SELECT_QUERY}
             FROM mint mi
             ${this.JOIN}
             WHERE unaccent(mi.name) ILIKE  unaccent($1) 
             ${this.ORDER}
        `, `%${text}%`)

            return this.postProcessMany(p)
        } else return []
    }


    static async list() {
        let p = await Database.manyOrNone(`
        SELECT 
        ${this.SELECT_QUERY}
         FROM mint mi
         ${this.JOIN}
         ${this.ORDER}
        `)

        return this.postProcessMany(p)
    }


    static fixGeoJSON(obj) {
        if (obj.uncertainArea != null && !GeoJSON.isEmpty(obj.uncertainArea) > 0) {
            obj["uncertain_area"] = obj.uncertainArea
        } else {
            obj["uncertain_area"] = null
        }
        delete obj.uncertainArea
    }


    static async postProcessGet(item) {
        item.uncertainArea = item.uncertain_area

        item = SQLUtils.objectify(item, {
            prefix: "province_",
            target: "province",
            keys: [
                "name",
                "id"
            ]
        })

        return item
    }

    static async postProcessMany(arr) {
        arr = arr.map(item => {
            this.postProcessGet(item)
            return item
        })
        return arr
    }

    static async getById(id, transaction = null) {
        if (transaction == null)
            transaction = Database

        const query = `
        SELECT
        mi.*,
            ST_AsGeoJSON(location) AS location,
                ST_AsGeoJSON(uncertain_area) AS uncertain_area,
                    p.id AS province_id,
                        p.name AS province_name
        FROM mint mi
        ${this.JOIN}
        WHERE mi.id = $1; `

        let mint = await transaction.one(query, [id])
        this.postProcessGet(mint)
        return mint
    }

    static extract(result, prefix = "") {
        return {
            id: result[`${prefix} id`],
            name: result[`${prefix} name`],
            location: result[`${prefix} location`],
            yearUncertain: result[`${prefix} yearUncertain`],
            uncertainLocation: result[`${prefix} uncertainLocation`]
        }
    }

    static query({
        tableName = "mi"
    } = {}) {
        return `
        ${tableName}.id AS mint_id,
            ${tableName}.name AS mint_name,
                ${tableName}.uncertain AS mint_uncertain,
                    ST_AsGeoJSON(${tableName}.uncertain_area) AS mint_uncertain_area,
                        ST_AsGeoJSON(${tableName}.location) AS mint_location,
                            `
    }

    static get SELECT_QUERY() {
        return `mi.*,
            ST_AsGeoJSON(location) AS location,
                ST_AsGeoJSON(uncertain_area) AS uncertain_area,
                    p.id AS province_id,
                        p.name AS province_name
        `
    }

    static get JOIN() {
        return `LEFT JOIN province p ON mi.province = p.id`
    }

    static get ORDER() {
        return `ORDER BY ${SQLUtils.normalizeString("mi.name")} ASC`
    }
}

module.exports = Mint