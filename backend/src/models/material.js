const { WriteableDatabase, Database } = require('../utils/database')


class Material {

    static get(id, { tableAlias = "ma", tableName = "material", transaction = null } = {}) {
        if (transaction == null)
            transaction = Database
        const query = `
        ${Material.select({ tableName: tableAlias })} 
        ${Material.colorJoin({ materialTableName: tableAlias })}
        WHERE ${tableAlias}.id = $[id]`
        return Database.oneOrNone(query, { id })
    }

    static select({
        tableName = "ma",
    }) {
        return `SELECT 
            ${this.query({ tableName })},
            ${this.colorQuery({ materialTableName: tableName })} 
         FROM 
            material ${tableName}
            `
    }

    static query({
        tableName = "ma"
    } = {}) {
        return `
        ${tableName}.id AS material_id,
        ${tableName}.name AS material_name
    `
    }

    static joins({
        joinTableName = "t",
        tableName = "material",
        tableAlias = "ma"
    } = {}) {
        return `LEFT JOIN ${tableName} ${tableAlias} 
        ON ${joinTableName}.material = ${tableAlias}.id
        `
    }

    static colorQuery({
        tableName = "mac"
    } = {}) {
        return `
        ${tableName}.color AS material_color
        `
    }

    static colorJoin({
        tableName = "material_color",
        tableAlias = "mac",
        materialTableName = "ma",
    } = {}) {
        return `
            LEFT JOIN ${tableName} AS ${tableAlias} ON ${materialTableName}.id = ${tableAlias}.material
        `
    }

}

module.exports = Material