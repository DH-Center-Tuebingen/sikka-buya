const Treasure = require('../../models/treasure.js')
const GQL = require('./gql.js')

class TreasureGQL extends GQL {
    static get Mutations() {
        return {
            addTreasure: (_, args) => Treasure.add(args.data),
            updateTreasure: (_, args) => Treasure.update(args.id, args.data),
            deleteTreasure: (_, args) => Treasure.delete(args.id),
        }
    }

    static get Queries() {
        return {
            treasureItem: (_, args, context, info) => Treasure.listItems(_, args, context, info),
            searchTreasure: (_, args, context, info) => Treasure.list(_, { filter: { name: args.text } }, context, info),
            getTreasure: (_, { id } = {}, context, info) => Treasure.get(id, context, info),
            treasure: (...args) => Treasure.list(...args),
            getTreasuresByMintSelection: (_, { mintIds } = {}, context, info) => Treasure.treasuresByMints(_, { mintIds }, context, info),
        }
    }
}

module.exports = TreasureGQL