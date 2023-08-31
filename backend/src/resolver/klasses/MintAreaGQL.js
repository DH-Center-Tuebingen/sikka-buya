const { search } = require('../../models/mint')
const MintArea = require("../../models/mint_area")
const GQL = require('./gql.js')

class MintAreaGQL extends GQL {

    static get Mutations() {
        return {
            addMintArea: async (_, { data = {} } = {}) => {
                await MintArea.add(data)
            },
            updateMintArea: async (_, { id, data = {} } = {}) => {
                await MintArea.update(id, data)
            },
            deleteMintArea: async (_, { id } = {}) => {
                await MintArea.delete(id)
            }
        }
    }

    static get Queries() {
        return {
            mintArea: async () => MintArea.list(),
            getMintArea: async (_, { id } = {}) => MintArea.get(id),
            searchMintArea: async (_, { text } = {}) => MintArea.search(text)
        }
    }
}

module.exports = MintAreaGQL