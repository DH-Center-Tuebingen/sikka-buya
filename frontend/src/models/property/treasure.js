
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
        location = null,
        items = []
    } = {}) {
        this.id = id
        this.name = name
        this.location = location
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
            .get(id, ["id", "name", "location",
                {
                    items: [
                        "id",
                        "count",
                        "year",
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

    async add() {
        await Query.raw(`
        mutation addTreasure($treasure: TreasureInput!) {
            addTreasure(data: $treasure)
        }
        `, {
            treasure: {
                name: this.name,
                location: this.location,
                items: this.items
            }
        })
    }

    async update(id) {
        await Query.raw(`
        mutation updateTreasure($id:ID!, $treasure: TreasureInput!) {
            updateTreasure(id:$id, data: $treasure)
        }
        `, {
            id,
            treasure: {
                name: this.name,
                location: this.location,
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
     * Create a treasure item.
     * @param {Object} [options] - The options object.
     * @param {string} [options.id=null] - The treasure item ID.
     * @param {number} [options.count=1] - The treasure item count.
     * @param {string} [options.coinType=null] - The treasure item project ID.
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
        coinType = null,
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
        this.coinType = coinType
        this.dynasty = dynasty
        this.mint = mint
        this.year = year
        this.nominal = nominal
        this.material = material
        this.fragment = fragment
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
            coinType: obj.coinType.hasOwnProperty("id") ? obj.coinType.id : obj.coinType,
            mint: obj.mint.hasOwnProperty("id") ? obj.mint.id : obj.mint,
            dynasty: obj.dynasty.hasOwnProperty("id") ? obj.dynasty.id : obj.dynasty,
            nominal: obj.nominal.hasOwnProperty("id") ? obj.nominal.id : obj.nominal,
            material: obj.material.hasOwnProperty("id") ? obj.material.id : obj.material,
        })

        return new TreasureItem(obj)
    }
}