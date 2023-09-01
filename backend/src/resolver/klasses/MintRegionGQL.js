const { search } = require('../../models/mint')
const MintRegion = require("../../models/mint_region")
const GQL = require('./gql.js')

class MintRegionGQL extends GQL {

    static get Mutations() {
        return {
            addMintRegion: async (_, { data = {} } = {}) => {
                await MintRegion.add(data)
            },
            updateMintRegion: async (_, { id, data = {} } = {}) => {
                await MintRegion.update(id, data)
            },
            deleteMintRegion: async (_, { id } = {}) => {
                await MintRegion.delete(id)
            }
        }
    }

    static get Queries() {
        return {
            mintRegion: async () => MintRegion.list(),
            getMintRegion: async (_, { id } = {}) => MintRegion.get(id),
            searchMintRegion: async (_, { text } = {}) => MintRegion.search(text)
        }
    }
}

module.exports = MintRegionGQL