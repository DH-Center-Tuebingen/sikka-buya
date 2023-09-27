
/**
 * The ManagedConfig is a utility function to make it easier
 * to interact with managed configuration files that are
 * curated by the backend. 
 * 
 * E.g. Here the Users can change global settings in the backend 
 * and those changes are reflected in the frontend without the
 * need for any API interaction.
 */
export default class ManagedConfig {
    constructor(path, root = window) {
        this.root = root

        if (!root[path]) {
            throw new Error(`Managed config was not found at ${path}`)
        } else {
            this.base = root[path]
        }
    }

    has(path) {
        let target = this.base
        let parts = path.split(".")
        let exists = false

        let pathParts = []
        while (parts.length > 0) {
            if (target) {
                let part = parts.shift()
                pathParts.push(part)

                if (parts.length === 1 && target.hasOwnProperty(part)) {
                    exists = true
                }

                target = target[part]
            } else {
                break
            }
        }

        return exists
    }

    get(path, defaultValue = null) {
        let target = this.base
        let value = defaultValue
        let parts = path.split(".")

        while (parts.length > 1) {
            let part = parts.shift()
            if (target[part] !== undefined) {
                target = target[part]
            } else {
                console.warn(`Invalid path ${path} using default value`)
                break
            }
        }

        if (parts.length === 1) {
            if (target.hasOwnProperty(parts[0])) {
                value = target[parts[0]]
            } else {
                console.warn(`Invalid path ${path} using default value`)
            }
        }

        return value
    }

    _typeValidatorFunction(path, defaultValue, type, validator) {
        const raw_value = this.get(path)
        if (raw_value == null) return null

        let { valid, value } = validator(raw_value)
        if (!valid) {
            console.warn(`Value at ${path} is not an ${type}. Using default value: ${defaultValue}.`)
            value = defaultValue
        }
        return value
    }

    getInteger(path, defaultValue = null) {
        return this._typeValidatorFunction(path, defaultValue, "integer", (str) => {
            const value = parseInt(str)
            return { valid: !isNaN(value), value }
        })
    }

    getBoolean(path, defaultValue = null) {
        return this._typeValidatorFunction(path, defaultValue, "boolean", (str) => {
            const value = (str === "true") ? true
                : (str === "false") ? false
                    : null
            return { valid: value !== null, value }
        })
    }
}