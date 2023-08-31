

class Model {
    constructor(tableName) {
        this._tableName = tableName
    }

    get tableName() {
        return this._tableName
    }
}

module.exports = Model