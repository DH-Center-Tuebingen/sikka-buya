/**
 * Baseclass for the GQL klasses.
 * 
 * With the GQL files, related queries stay neatly together in 
 * one file.
 * 
 */

class GQL {

    /**
     * mutations implement all mutations
     */
    static get Mutations() {
        throw new Error('Mutations not implemented')
    }

    /**
     * queries implement all public queries
     */
    static get Queries() {
        throw new Error('Queries not implemented')
    }
}

module.exports = GQL