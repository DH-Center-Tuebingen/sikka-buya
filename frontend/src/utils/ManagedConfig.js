
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

    get(path) {
        let target = this.base
        console.log(path)
        let parts = path.split(".")

        while (parts.length > 0) {
            let part = parts.shift()
            if (target[part] !== undefined) {
                target = target[part]
            } else {
                target = null
                break
            }
        }

        return target
    }
}