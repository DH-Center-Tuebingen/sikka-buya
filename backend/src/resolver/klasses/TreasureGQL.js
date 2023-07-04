const Treasure = require('../../models/Treasure')
const GQL = require('./GQL.js')

class TreasureGQL extends GQL {
    static get Mutations() {
        return {
            addTreasure: (_, args) => Treasure.add(args.data),
            updateTreasure: (_, args) => Treasure.update(args.id, args.data),
            deleteTreasure: (args) => Treasure.delete(args.data),
        }
    }

    static get Queries() {
        return {
            getTreasure: (_, { id } = {}, context, info) => Treasure.get(id, context, info),
            treasure: (...args) => Treasure.list(...args),
        }
    }
}

module.exports = TreasureGQL