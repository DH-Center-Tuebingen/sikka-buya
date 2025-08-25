const GQL = require('./gql.js')
const Type = require('../../utils/type.js')
const CoinType = require('../../models/coin-type.js')

class CoinTypeGQL extends GQL {

    static get SuperMutations() {
        return {
            setTypeComplete: (_, args) => CoinType.setComplete(args),
            setTypeReviewed: (_, args) => CoinType.setReviewed(args),
        }
    }

    static get Mutations() {
        return {
            addCoinType: (_, args, context) => CoinType.add(args, context),
            deleteCoinType: (_, args, context) => CoinType.delete(args, context),
            updateCoinType: (_, args, context) => CoinType.update(args, context),
        }
    }

    static get Queries() {
        return {
            getCoinType: async function () {
                return Type.getType(...arguments)
            },
            coinType: async function () {
                return Type.list(...arguments)
            },
        }
    }

    static get UserQueries() {
        return {
            // Same as getCoinTypes, but also allow to filter for 'completed' and 'reviewed' types.
            modGetTypes: async function (_, args, context) {

                args.additionalRows = [`CASE WHEN tc.type is null
            then False
            else True 
            END AS completed`, `CASE WHEN tr.type is null
            then False
            else True 
            END AS reviewed`]
                args.additionalJoin = `LEFT JOIN type_completed tc ON t.id = tc.type
    LEFT JOIN type_reviewed tr ON t.id = tr.type`


                const modTypes = await Type.getTypes(...arguments)
                modTypes.modReview = modTypes.types
                return modTypes
            },
        }
    }
}

module.exports = CoinTypeGQL