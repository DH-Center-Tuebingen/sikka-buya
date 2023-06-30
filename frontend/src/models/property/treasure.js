
/**
 * Class representing a treasure.
 * @class
 */
export class Treasure {

    /**
     * Create a treasure.
     * @param {Object} [options] - The options object.
     * @param {string} [options.id=null] - The treasure ID.
     * @param {string} [options.name=null] - The treasure name.
     * @param {string} [options.location=null] - The treasure location.
     * @param {Array} [options.items=[]] - The treasure items.
     */
    constructor({
        id = null,
        name = null,
        location = null,
        items = []
    } = {}) {
        this.id = id
        this.name = name
        this.location = location
        this.items = items
    }

}


/**
 * Class representing a treasure item.
 * @class
 */
export class TreasureItem {

    /**
     * Create a treasure item.
     * @param {Object} [options] - The options object.
     * @param {string} [options.id=null] - The treasure item ID.
     * @param {number} [options.count=1] - The treasure item count.
     * @param {string} [options.projectId=null] - The treasure item project ID.
     * @param {string} [options.dynasty=null] - The treasure item dynasty.
     * @param {string} [options.mint=null] - The treasure item mint.
     * @param {string} [options.year=null] - The treasure item year.
     * @param {string} [options.nominal=null] - The treasure item nominal.
     * @param {string} [options.material=null] - The treasure item material.
     * @param {boolean} [options.fragment=false] - The treasure item fragment.
     */
    constructor({
        id = null,
        count = 1,
        projectId = null,
        dynasty = null,
        mint = null,
        year = null,
        nominal = null,
        material = null,
        fragment = false
    } = {}
    ) {
        this.id = id
        this.count = count
        this.projectId = projectId
        this.dynasty = dynasty
        this.mint = mint
        this.year = year
        this.nominal = nominal
        this.material = material
        this.fragment = fragment
    }

}