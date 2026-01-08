const { pgp } = require("./database")

class SQLUtils {

    static normalizeString(text) {
        return pgp.as.format("regexp_replace(lower(unaccent($[text:raw])), '^(ad-|al-|ar-|ʿ)', '')", { text })
    }


    static removeNullProperty(obj, prop, name = "id") {
        if (obj[prop] && obj[prop][name] && obj[prop][name] == null) {
            delete obj[prop]
        }
    }

    /**
     * @typedef ObjectifyConfig
     * @type {object}
     * @property {string} prefix - Defines the prefix used for the target parameters (e.g. *prefix_*)
     * @property {string} target - Defines the target property, that will store the deconstructed value (e.g. 'person' would create a new object inside the result that is named 'person' which will be the parent of all properties). 
    *  @property {Array.<string>} keys - Defines the keys that are used after the prefix (e.g. we destructre person_id and person_name. Then our keys would be ["id", "name"]).
    */



    /**
     * 
     * @param {*} obj 
     * @param {*} config 
     */
    static objectifyBulkList(arr, config) {
        arr.forEach((obj, idx) => {
            config.forEach(conf => {
                arr[idx] = SQLUtils.objectify(obj, conf)
            })
        })
        return arr
    }

    /**
     * 
     * @param {*} obj 
     * @param {*} config 
     */
    static objectifyBulk(obj, config) {
        config.forEach(conf => {
            SQLUtils.objectify(obj, conf)
        })
        return obj
    }

    /**
     * Rewraps the result of a database result into an object.
     * 
     * @example
     * 
     * When we joined the name and the id of a person to our request, the
     * result may look like this:
     * let response = {... , person_id, person_name, ...}
     * 
     * But for GraphQL we need the person to represent a single object. Then we provide
     * the config as follows:
     * let config = {
     *          prefix: "person_",
     *          target: "person",
     *          keys: ["id", "name"]
     * }
     * 
     * Running: let result = objectify(response, config)
     * Returns: [return] { ... , person: {id, name}, ...} 
     * 
     * 
     * @param {object} obj - Represents the database response object of some query.
     * @param {ObjectifyConfig} config - Defines the operations the objectify function will perform.
     */
    static objectify(obj, config) {
        if (!config.prefix) throw new Error("Object has no prefix!")

        let targetObject = obj

        if (config.target) {
            let parts = config.target.split(".")

            let current = obj
            parts.forEach(part => {
                /**
                 * If a non-object value already exists at the path, it will be overwritten.
                 */
                if (typeof current[part] != 'object') current[part] = {}
                current[part] = (current[part]) ? current[part] : {}
                current = current[part]
            })
            targetObject = current
        }

        config.keys.forEach(key => {
            if (typeof key === 'string') {
                const targetKey = this.snakeToCamelCase(key)
                if (obj[config.prefix + key] !== undefined) {
                    let targetValue = obj[config.prefix + key]
                    targetObject[targetKey] = targetValue
                    delete obj[config.prefix + key]
                } else console.error(`Key '${config.prefix + key}' was not found on object:\n${JSON.stringify(obj)}`)
            } else if (typeof key === 'object') {
                const child_conf = key
                if (!child_conf.prefix) throw new Error("Wrong config. Child has no prefix!")
                child_conf.prefix = config.prefix + child_conf.prefix
                this.objectify(obj, child_conf)
            } else console.error(`Key has wrong type: ` + typeof key)
        })
        return obj
    }

    /**
     * Extracts a range from an object and stores it in a new property.
     * By default it looks for properties named `${rangeName}_from` and `${rangeName}_to`.
     * Otherwise the keys can be specified manually.
     * 
     * @param {object} obj - Object to extract the range from and to.
     * @param {string} rangeName  - Name of the range property.
     * @param {string|null} fromKey - Name of the 'from' key.
     * @param {string|null} toKey - Name of the 'to' key.
     * @returns 
     */
    static extractRange(obj, rangeName, fromKey = null, toKey = null) {
        if(!fromKey) fromKey = rangeName + "_from"
        if(!toKey) toKey = rangeName + "_to"

        obj[rangeName] = {
            from: obj[fromKey],
            to: obj[toKey]
        }

        delete obj[fromKey]
        delete obj[toKey]

        return obj
    }

    /**
     * Separates a range object into two properties.
     * By default it creates properties named `${rangeName}_from` and `${rangeName}_to`.
     * Otherwise the keys can be specified manually.
     *
     * @param {object} obj - Object to separate the range from.
     * @param {string} rangeName - Name of the range property.
     * @param {string|null} fromKey - Name of the 'from' key.
     * @param {string|null} toKey - Name of the 'to' key.
     * @returns
     */
    static separateRange(obj, rangeName, fromKey = null, toKey = null) {
        if(!fromKey) fromKey = rangeName + "_from"
        if(!toKey) toKey = rangeName + "_to"

        if(obj[rangeName]) {
            obj[fromKey] = obj[rangeName].from
            obj[toKey] = obj[rangeName].to
            delete obj[rangeName]
        }

        return obj
    }

    /**
     * Performs an objectify on a list of elements.
     * 
     * @param {[object]} arr 
     * @param {ObjectifyConfig} config - Defines the operations the objectify function will perform.
     * @returns 
     */
    static objectifyList(arr, config) {
        arr.forEach((obj, idx) => {
            arr[idx] = this.objectify(obj, config)
        })
        return arr
    }

    static listifyBulk(obj, config) {
        config.forEach((config) => {
            this.listify(obj, config)
        })
    }

    static listify(obj, config) {
        obj[config.target] = []
        config.keys.forEach((key, key_num) => {
            if (obj[config.prefix + key]) {
                obj[config.prefix + key].forEach((entry, i) => {
                    if (!obj[config.target][i]) obj[config.target].push({})
                    obj[config.target][i][config.to[key_num]] = entry
                })
                delete obj[config.prefix + key]
            }
        })
    }

    static transformPropertyToSnakeCase(obj, property) {
        let snakeCase = SQLUtils.camelCaseToSnakeCase(property)
        obj[snakeCase] = obj[property]
        delete obj[property]
        return obj
    }

    static camelCaseToSnakeCase(str) {
        return str.replace(/[A-Z]/g, (match) => {
            return `_${match.toLowerCase()}`
        })
    }

    static transformPropertyToCamelCase(obj, property) {
        let camelCase = SQLUtils.snakeToCamelCase(property)
        obj[camelCase] = obj[property]
        delete obj[property]
        return obj
    }

    static snakeToCamelCase(str) {
        return str.replace(/_[a-zA-Z]{1}/g, (match) => {
            return match.charAt(1).toUpperCase()
        })
    }
}

module.exports = SQLUtils