export default class GraphQLUtils {

    /**
     * Takes an array and destructure the strings into a
     * GraphQLBody.
     * 
     * If an element is an object. It will be destructured 
     * recursively. The key being the parent key.
     * 
     */
    static buildQueryBody(properties) {
        let parts = []

        if(!Array.isArray(properties) || properties.length == 0) {
            return "";
        }

        for (let val of properties.values()) {
            if (typeof val == "object") {
                for (let [key, childArr] of Object.entries(val)) {
                    if (Array.isArray(childArr)) {
                        parts.push(`${key}${this.buildQueryBody(childArr)}`)
                    } else {
                        console.error(`Cannot destructure ${key}, value is no array!`, val)
                    }
                }
            } else {
                parts.push(val)
            }
        }
        return `{${parts.join(",")}}`;
    }

    /**
     * Takes an object and transforms it into a mutation body.
     * @param {obj} data 
     */

    static buildMutationParams(data) {
        if (data == null) return "null"
        
        if (typeof data == "object") {
            if (Array.isArray(data)) {
                return `[${data.map(item => this.buildMutationParams(item)).join(",")}]`
            } else {
                return `{\n${Object.entries(data).map(([key, val]) => key + ": " + this.buildMutationParams(val)).join(",\n")}\n}`
            }
        } else {
            if (typeof data === "string") {
                return `"${data}"`
            }
            
            return data.toString()
        }
    }
}