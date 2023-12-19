
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
    constructor(path, template, root = window) {
        this.root = root
        this.template = template

        if (!template) {
            console.error("ManagedConfig requires a template to be passed.")
            return
        }

        if (!root[path]) {
            console.error(`Managed config was not found at ${path}`)
        } else {
            this.base = root[path]
        }
    }



    has(path) {
        let target = this.base
        let parts = path.split(".")

        const jsWalker = new ObjectWalker(target)
        const templateWalker = new ObjectWalker(this.template)

        while (parts.length > 0) {
            if (this.template) {
                const part = parts.shift()
                jsWalker.next(part)
                templateWalker.next(part)

                if (!jsWalker.status && !templateWalker.status) {
                    break
                }
            }
        }

        if (!templateWalker.status) console.warn(`Path was not defined in template: ${path}`)
        return jsWalker.status
    }


    /**
     * Gets multiple paths and returns the first one that is defined.
     * Useful when overwriting a specific path with an default path.
     * 
     * @param  {...any} paths 
     * @returns 
     */
    joinMultiple(...paths) {

        let returnValue = null

        let jsWalker
        for (let path of paths) {
            let target = this.base
            const track = new ObjectTrack(path)
            jsWalker = new ObjectWalker(target)
            track.walk((part) => {
                jsWalker.next(part)
                return jsWalker.status
            })

            if (jsWalker.status) {
                returnValue = jsWalker.value
                try {
                    returnValue = JSON.parse(returnValue)
                } catch (e) {
                    // do nothing
                }
                break
            }
        }

        if (!jsWalker.status) {
            let templateWalker
            for (let path of paths) {
                const track = new ObjectTrack(path)
                templateWalker = new ObjectWalker(this.template)
                track.walk((part) => {
                    templateWalker.next(part)
                    return templateWalker.status
                })

                if (templateWalker.status) {
                    returnValue = templateWalker.value
                    break
                }
            }

            if (!templateWalker.status) console.warn(`None of the paths were defined in template: ${paths.join(", ")}`)
            else console.error(`None of the paths were defined, applied template: ${paths.join(", ")}`, returnValue)
        }

        return returnValue
    }

    _get(path) {
        let target = this.base

        const track = new ObjectTrack(path)
        const jsWalker = new ObjectWalker(target)
        const templateWalker = new ObjectWalker(this.template)

        console.log(this.template, target)

        track.walk((part) => {
            jsWalker.next(part)
            templateWalker.next(part)
            return jsWalker.status || templateWalker.status
        })

        

        return {
            jsWalker,
            templateWalker
        }
    }


    get(path) {

        const { jsWalker, templateWalker } = this._get(path)
        if (!jsWalker.status) {
            let templateAddin = ""
            if (templateWalker.status) {
                jsWalker.value = templateWalker.value
                templateAddin = ", using template value instead"
            }

            console.error(`Path was not defined in config${templateAddin}: ${path}`)
        } else {
            if (!templateWalker.status) console.warn(`Path was not defined in template: ${path}`)
        }

        return jsWalker.value
    }

    _typeValidatorFunction(path, type, validator) {
        let raw_value = this.get(path)
        if (raw_value == null) return null
        // TODO: Fix this in the backend that it does only have atmost one empty string
        while(raw_value[""] !== undefined) raw_value = raw_value[""]
        if (raw_value == null) return null

        let { valid, value } = validator(raw_value)
        if (!valid) {
            console.warn(`Value at ${path} is not an ${type}.`)
        }
        return value
    }

    getInteger(path) {
        return this._typeValidatorFunction(path, "integer", (str) => {
            const value = parseInt(str)
            return { valid: !isNaN(value), value }
        })
    }

    getBoolean(path) {
        return this._typeValidatorFunction(path, "boolean", (str) => {
            if(str === true || str === false) return { valid: true, value: str }

            const value = (str === "true") ? true
                : (str === "false") ? false
                    : null
            return { valid: value !== null, value }
        })
    }

    getArray(path) {
        return this._typeValidatorFunction(path, "array", (value) => {
            try {
                value = JSON.parse(value)
            } catch (e) {
                return { valid: false, value }
            }
            return { valid: Array.isArray(value), value }
        })

    }
}


class ObjectTrack {
    constructor(path, separator = ".") {
        this.parts = path.split(separator)
    }

    walk(callback) {
        while (this.parts.length > 0) {
            const part = this.parts.shift()
            if (!callback(part)) break;
        }
    }
}

class ObjectWalker {
    constructor(obj) {
        this.reset(obj)
    }

    reset(obj) {
        this.obj = obj
        this.value = obj
        this.status = true
    }

    next(key) {
        if (!this.status) return false
        if (this.value.hasOwnProperty(key)) {
            this.value = this.value[key]
            return true
        } else {
            this.value = undefined
            this.status = false
            return false
        }
    }
}