const Treasure = require('../../models/Treasure')
const GQL = require('./GQL.js')

class TreasureGQL extends GQL {
    static get Mutations() {
        return {
            addTreasure: (_, args) => Treasure.add(args.data),
            updateTreasure: (_, args) => Treasure.update(args.data),
            deleteTreasure: (args) => Treasure.delete(args.data),
        }
    }

    static get Queries() {
        return {
            getTreasure: (_, args) => Treasure.get(args),
            treasure: (...args) => Treasure.list(...args),
        }
    }
}

module.exports = TreasureGQL