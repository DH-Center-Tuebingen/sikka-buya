import Mode from "../models/Mode"

export default class URLParams {

    static get symbols() {
        return {
            and: "~",
            array: ",",
            multiArray: ";",
        }
    }

    /**
     * Removes all existing parmameters and sets all 
     * specified parameters. 
     * 
     * @param {*} params 
     * @returns 
     */
    static generate(params) {
        let url = new URL(window.location)
        url.searchParams.forEach((_, key) => {
            url.searchParams.delete(key)
        })

        for (let [key, value] of Object.entries(params)) {

            if (value === true) value = "1"
            if (value === false) value = "0"

            if (value != null)
                url.searchParams.set(key, value)
        }

        return url
    }


    /**
     * Get's an object of URLParams from an config object.
     * 
     * @param {Object} config - The configuration of how to get the query files. The object has the form of: {name: type, ...} 
     * @returns Object with the names as keys and values
     */
    static getMany(config) {
        let obj = {}
        for (let [name, type] of Object.entries(config)) {
            let val = this.get(name, type)
            if (val != null) obj[name] = val
        }
        return obj
    }


    /**
     * Get's the URLParam by name of a specific type.
     * 
     * @param {String} name - Name of key of the variable
     * @param {String} type - Type of the variable, allowed types are: array, int and bool.
     * @returns Returns the respective value of the variable. 
     */
    static get(name, type = "string") {
        switch (type) {
            case 'string':
                return URLParams.getString(name)
            case 'array':
                return URLParams.getArray(name)
            case 'int':
                return URLParams.getInteger(name)
            case 'bool':
                return URLParams.getBoolean(name)
            default:
                throw new Error(`URLParams 'get' type not implemented: ${type}!`)
        }
    }

    /**
     * Retrieves an array by a key.
     * Also transforms a single value into an 
     * array if only one is present.
     * 
     * @param {String} key 
     * @returns {Array | null} Array or null when no value was found.
     */
    static getArray(key, type = "string") {
        let arr = null
        let url = new URL(window.location);

        if (url.searchParams.has(key)) {
            const queryVariable = url.searchParams.get(key)
            if (queryVariable === "null" || queryVariable === '') return []
            arr = URLParams.fromStringArray(queryVariable)


            if (type !== 'string') {
                arr = this._parseArray(arr, type)
            }
            return arr
        }
    }

    static toMultiSelect(array, mode) {
        return `${mode === Mode.And ? URLParams.symbols.and : ""}${array.map(obj => obj.id).join(URLParams.symbols.array)}`
    }

    static getMultiSelect(key) {
        let obj = { value: [], mode: Mode.Or }
        let url = new URL(window.location);

        if (url.searchParams.has(key)) {

            let searchParams = url.searchParams.get(key)
            if (searchParams.charAt(0) === URLParams.symbols.and) {
                obj.mode = Mode.And
                searchParams = searchParams.substring(1)
            }

            obj.value = URLParams.fromStringArray(searchParams).map((val, index) => ({ name: "...", id: parseInt(val), index }))
        }

        return obj
    }

    static toMultiSelect2D(array2d, mode) {
        return `${mode === Mode.And ? URLParams.symbols.and : ""}${array2d.map(array => array.map(obj => obj.id).join(URLParams.symbols.array)).join(URLParams.symbols.multiArray)}`
    }

    static getMultiSelect2D(key) {
        let obj = { value: [[]], mode: Mode.Or }
        let url = new URL(window.location);

        if (url.searchParams.has(key)) {

            let searchParams = url.searchParams.get(key)

            if (searchParams.charAt(0) === URLParams.symbols.and) {
                obj.mode = Mode.And
                searchParams = searchParams.substring(1)
            }


            const value = searchParams
                .split(URLParams.symbols.multiArray)
                .filter(a => a !== "")
                .reduce((acc, arrayString) => {
                    const arr = URLParams
                        .fromStringArray(arrayString)
                        .map((val, index) => ({ name: `...(${val})`, id: parseInt(val), index }))
                    acc.push(arr)
                    return acc
                }, [])

            obj.value = value
        }

        return obj
    }



    /**
     *  Parses an array of strings to a specific type.
     * 
     * @param {*} arr - Array of strings
     * @param {*} type - Type of the array
     * @returns  Array of the specific type
     */
    static _parseArray(arr, type) {
        switch (type) {
            case 'int':
                arr = arr.map((val) => parseInt(val))
                break;
            case 'bool':
                arr = arr.map((val) => val === 'true')
                break;
            default:
                throw new Error(`URLParams 'getArray' type not implemented: ${type} !`)
        }
        return arr
    }


    static getString(key, defaultValue = null) {
        let url = new URL(window.location)
        return url.searchParams.get(key) || defaultValue
    }

    /**
     * All params in the URL string are strings.
     * So there are a few methods to get the respective
     * data type from the string directly.
     * 
     * If either the parameter is not found or 
     * a conversion is not possible, a default value is returned.
     */
    static getInteger(key, defaultValue, allowNull = true) {
        let value = defaultValue
        let url = new URL(window.location)
        const queryParam = url.searchParams.get(key)

        if (allowNull && url.searchParams.has(key) && queryParam == null) {
            return null
        }

        let integer = parseInt(queryParam)
        if (queryParam && !isNaN(integer)) {
            value = integer
        }

        return value

    }

    /**
    * All params in the URL string are strings.
    * So there are a few methods to get the respective
    * data type from the string directly.
    * 
    * If either the parameter is not found or 
    * a conversion is not possible, a default value is returned.
    */
    static getBoolean(key, defaultValue) {
        let value = defaultValue
        let url = new URL(window.location)
        const queryParam = url.searchParams.get(key)

        if (queryParam !== undefined) {
            if (queryParam === "true" || queryParam === "1") value = true
            else if (queryParam === "false" || queryParam === "0") value = false
        }

        return value
    }

    /**
     * Removes all parameters from the URL.
     * 
     * Note: May be used to prevent the user to get the same
     * result when refreshing the page.
     */
    static clear() {
        window.history.replaceState(null, "", location.pathname)
    }

    static fromStringArray(str) {
        return str.split(",")
    }

    static toStringArray(arr) {
        return arr.join(",")
    }

    static fromObject(obj) {
        let strings = {}
        for (let [key, value] of Object.entries(obj)) {
            if (Array.isArray(value)) {

                strings[key] = value.map((v) => {
                    if (typeof v === 'object') {
                        return v.id
                    } else {
                        return v
                    }
                })
            } else if (typeof value === 'object') {
                throw new Error("Object is no implemented")
            } else {
                strings[key] = value
            }
        }
        return strings
    }
}