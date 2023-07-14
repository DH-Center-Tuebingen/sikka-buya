
import Query from "@/database/query"

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
        literature = null,
        location = null,
        timespan = { from: null, to: null },
        items = []
    } = {}) {
        this.id = id
        this.name = name
        this.literature = literature
        this.location = location
        this.timespan = timespan
        this.items = items
    }

    async upsert() {
        const id = parseInt(this.id)
        if (!isNaN(id) && id > 0) {
            this.add()
        } else {
            this.update()
        }
    }

    async get(id) {
        const result = await new Query("treasure")
            .get(id, [
                "id",
                "name",
                "location",
                "literature",
                { timespan: ["from", "to"] },
                {
                    items: [
                        "id",
                        "count",
                        "year",
                        "weight",
                        { coinType: ["id", "projectId"] },
                        { mint: ["id", "name"] },
                        { dynasty: ["id", "name"] },
                        { nominal: ["id", "name"] },
                        { material: ["id", "name"] },
                        "fragment"]
                }
            ])

        return result?.data?.data?.getTreasure
    }

    fixLocation(location) {
        if (location.coordinates && Array.isArray(location.coordinates)) {
            let flat = location.coordinates.flat(Infinity)
            if (flat.length === 0) return null
            else return location
        } else {
            return null
        }
    }

    async add() {
        await Query.raw(`
        mutation addTreasure($treasure: TreasureInput!) {
            addTreasure(data: $treasure)
        }
        `, {
            treasure: {
                name: this.name,
                location: this.fixLocation(this.location),
                literature: this.literature,
                timespan: this.timespan,
                items: this.items
            }
        })
    }

    async update(id) {
        console.log(this.timespan)
        await Query.raw(`
        mutation updateTreasure($id:ID!, $treasure: TreasureInput!) {
            updateTreasure(id:$id, data: $treasure)
        }
        `, {
            id,
            treasure: {
                name: this.name,
                location: this.fixLocation(this.location),
                literature: this.literature,
                timespan: this.timespan,
                items: this.items
            }
        })
    }

}


/**
 * Class representing a treasure item.
 * @class
 */
export class TreasureItem {

    /**
     * Creates a new instance of the TreasureItem class.
     * @constructor
     * @param {Object} [options] - The options to initialize the TreasureItem instance with.
     * @param {string} [options.coinType=null] - The type of coin.
     * @param {number} [options.count=1] - The number of items.
     * @param {string} [options.dynasty=null] - The dynasty of the coin.
     * @param {boolean} [options.fragment=false] - Whether the item is a fragment.
     * @param {number} [options.id=null] - The ID of the item.
     * @param {string} [options.material=null] - The material of the coin.
     * @param {string} [options.mint=null] - The mint of the coin.
     * @param {string} [options.nominal=null] - The nominal of the coin.
     * @param {number} [options.weight=null] - The weight of the coin.
     * @param {number} [options.year=null] - The year of the coin.
     */
    constructor({
        coinType = null,
        count = 1,
        dynasty = null,
        fragment = false,
        id = null,
        material = null,
        mint = null,
        nominal = null,
        weight = null,
        year = null,
    } = {}
    ) {
        this.coinType = coinType
        this.count = count
        this.dynasty = dynasty
        this.fragment = fragment
        this.id = id
        this.material = material
        this.mint = mint
        this.nominal = nominal
        this.weight = weight
        this.year = year
    }


    forInput() {
        return Object.assign({}, this, {
            coinType: { id: this.coinType?.id || null, projectId: this.coinType?.projectId || "" },
            mint: { id: this.mint?.id || null, name: this.mint?.name || "" },
            dynasty: { id: this.dynasty?.id || null, name: this.dynasty?.name || "" },
            nominal: { id: this.nominal?.id || null, name: this.nominal?.name || "" },
            material: { id: this.material?.id || null, name: this.material?.name || "" },
        })
    }

    static fromInputs(obj) {
        obj = Object.assign({}, obj, {
            count: parseInt(obj.count),
            weight: parseFloat(obj.weight),
            coinType: obj.coinType.hasOwnProperty("id") ? obj.coinType.id : obj.coinType,
            mint: obj.mint.hasOwnProperty("id") ? obj.mint.id : obj.mint,
            dynasty: obj.dynasty.hasOwnProperty("id") ? obj.dynasty.id : obj.dynasty,
            nominal: obj.nominal.hasOwnProperty("id") ? obj.nominal.id : obj.nominal,
            material: obj.material.hasOwnProperty("id") ? obj.material.id : obj.material,
        })

        return new TreasureItem(obj)
    }
}