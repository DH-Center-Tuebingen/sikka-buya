const GQL = require('./gql.js')
const capitalize = require('lodash/capitalize')

class PropertiesGQLGenerator {
    constructor(name, model) {
        this.name = name
        this.model = model
    }

    get capitalizedName() {
        return capitalize(this.name)
    }

    generateMutations() {
        return {
            [`add${this.capitalizedName}`]: this.model.add,
            [`update${this.capitalizedName}`]: this.model.update,
            [`delete${this.capitalizedName}`]: this.model.delete,
        }
    }

    generateQueries() {
        return {
            [`search${this.capitalizedName}`]: this.model.search,
            [`get${this.capitalizedName}`]: this.model.get,
            [this.name]: this.model.list,
        }
    }
}

module.exports = PropertiesGQL