const SQLUtils = require("../utils/sql")

class Overlord {

    static extractList(arr, options) {
        arr.forEach((obj, idx) => {
            arr[idx] = this.extract(obj, options)
        });
        return arr
    }

    static extract(result) {
        const config = [
            {
                prefix: `person_`,
                target: null,
                keys: ["id", "name", "color", {
                    prefix: "role_",
                    target: "role",
                    keys: ["id", "name"]
                }, {
                        prefix: "dynasty_",
                        target: "dynasty",
                        keys: ["id", "name"]
                    }, "short_name"]
            }
        ]

        SQLUtils.objectifyBulk(result, config)

        const arrays = [
            {
                target: "honorifics",
                prefix: `honorific_`,
                keys: ["ids", "names"],
                to: ["id", "name"]
            },
            {
                target: "titles",
                prefix: `title_`,
                keys: ["ids", "names"],
                to: ["id", "name"]
            },
        ]

        SQLUtils.listifyBulk(result, arrays)

        return result
    }
}

module.exports = Overlord