
import Query from "../../database/query"

/**
 * Class representing a treasure.
 * @class
 */
export class OttomanTreasure {

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
        description = null,
        location = null,
        timespan = { from: null, to: null },
        items = [],
        color = null,
    } = {}) {
        this.id = id
        this.name = name
        this.description = description
        this.location = location
        this.timespan = timespan
        this.items = items
        this.color = color
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
        return new Query("treasure")
            .get(id, [
                "id",
                "name",
                "location",
                "description",
                "color",
                { timespan: ["from", "to"] },
                {
                    items: [
                        "id",
                        "count",
                        "year",
                        "weight",
                        { coinType: ["id", "projectId"] },
                        { "mintRegion": ["id", "name"] },
                        { epoch: ["id", "name"] },
                        { nominal: ["id", "name"] },
                        { material: ["id", "name"] },
                        "uncertainYear",
                        "mintRegionUncertain",
                        "fragment",
                        "reconstructed",
                        "mintAsOnCoin",

                        "singleFind",
                        "reliableAttribution",
                        "completeHoard",
                        "ottomanPredominance",

                        { person: ["id", "name"] },
                        { historicalRegion: ["id", "name"] },
                        { issuingState: ["id", "name"] },

                        { yearOfLoss: ["from", "to"] },
                        { yearOfMint: ["from", "to"] },

                        "circumstances",
                        "authenticity",
                        "subclassification",
                    ]
                }
            ])
    }

    fixLocation(location) {

        let coordinates = location?.coordinates || location?.geometry?.coordinates || []

        if (!Array.isArray(coordinates)) return null
        let flat = coordinates.flat(Infinity)
        if (flat.length === 0) return null

        return location
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
                description: this.description,
                color: this.color,
                timespan: this.timespan,
                items: this.items
            }
        }, true)
    }

    async update(id) {
        let location = this.fixLocation(this.location)
        await Query.raw(`
        mutation updateTreasure($id:ID!, $treasure: TreasureInput!) {
            updateTreasure(id:$id, data: $treasure)
        }
        `, {
            id,
            treasure: {
                name: this.name,
                location,
                description: this.description,
                color: this.color,
                timespan: this.timespan,
                items: this.items
            }
        }, true)
    }

}


/**
 * Class representing a treasure item.
 * @class
 */
export class OttomanTreasureItem {

    /**
     * Creates a new instance of the TreasureItem class.
     * @constructor
     * @param {Object} [options] - The options to initialize the TreasureItem instance with.
     * @param {string} [options.coinType=null] - The type of coin.
     * @param {number} [options.count=1] - The number of items.
     * @param {string} [options.epoch=null] - The epoch of the coin.
     * @param {boolean} [options.fragment=false] - Whether the item is a fragment.
     * @param {number} [options.id=null] - The ID of the item.
     * @param {string} [options.material=null] - The material of the coin.
     * @param {string} [options.mintRegion=null] - The mintRegion of the coin.
     * @param {string} [options.nominal=null] - The nominal of the coin.
     * @param {boolean} [options.uncertainMint=null] - The name of the mint if it is not certain
     * @param {boolean} [options.uncertainYear=null] - The year of the coin if it is not certain
     * @param {number} [options.weight=null] - The weight of the coin.
     * @param {number} [options.year=null] - The year of the coin.
     * @param {string} [options.mintAsOnCoin=null] - The mint as it is written on the coin.
     * @param {boolean} [options.reconstructed=false] - Whether the item is reconstructed.
     */
    constructor({
        coinType = null,
        count = 1,
        epoch = null,
        fragment = false,
        id = null,
        material = null,
        mintRegion = null,
        nominal = null,
        mintRegionUncertain = false,
        uncertainYear = null,
        weight = null,
        year = null,
        mintAsOnCoin = null,
        reconstructed = false,

        singleFind = false,
        reliableAttribution = false,
        completeHoard = false,
        ottomanPredominance = false,
        person = { from: null, to: null },
        historicalRegion = { from: null, to: null },
        issuingState = { from: null, to: null },
        yearOfLoss = null,
        yearOfMint = null,
        circumstances = null,
        authenticity = null,
        subclassification = null,
    } = {}
    ) {
        this.coinType = coinType
        this.count = count
        this.epoch = epoch
        this.fragment = fragment
        this.id = id
        this.material = material
        this.mintRegion = mintRegion
        this.nominal = nominal
        this.mintRegionUncertain = mintRegionUncertain
        this.uncertainYear = uncertainYear
        this.weight = weight
        this.year = year
        this.mintAsOnCoin = mintAsOnCoin
        this.reconstructed = reconstructed

        this.singleFind = singleFind
        this.reliableAttribution = reliableAttribution
        this.completeHoard = completeHoard
        this.ottomanPredominance = ottomanPredominance

        this.person = person
        this.historicalRegion = historicalRegion
        this.issuingState = issuingState

        this.yearOfLoss = yearOfLoss
        this.yearOfMint = yearOfMint
        this.circumstances = circumstances
        this.authenticity = authenticity
        this.subclassification = subclassification
    }

    static rowDefinition() {
        return [
            { type: 'index', label: '#', attribute: null },
            { type: 'number', label: 'Quantity', attribute: 'count' },

            { type: 'boolean', label: 'Single Find?', attribute: 'singleFind' },

            { type: 'boolean', label: 'Reliable Attribution', attribute: 'reliableAttribution' },
            { type: 'boolean', label: 'Complete Hoard', attribute: 'completeHoard' },
            { type: 'boolean', label: 'Ottoman Predominance', attribute: 'ottomanPredominance' },

            { type: 'model', label: 'Coin Type', attribute: 'coinType' },
            { type: 'model', label: 'Material', attribute: 'material' },
            { type: 'model', label: 'Denomination', attribute: 'nominal' },
            { type: 'model', label: 'Mint', attribute: 'mintRegion' },
            { type: 'model', label: 'Issuer', attribute: 'person' },
            { type: 'model', label: 'Historical Region', attribute: 'historicalRegion' },
            { type: 'model', label: 'Issuing State', attribute: 'issuingState' },

            { type: 'range', label: 'Year Of Loss', attribute: 'yearOfLoss' },
            { type: 'range', label: 'Year Of Minting', attribute: 'yearOfMint' },

            { type: 'text', label: 'Circumstances', attribute: 'circumstances' },
            { type: 'text', label: 'Authenticity', attribute: 'authenticity' },
            { type: 'text', label: 'Subclassification', attribute: 'subclassification' },

        ];
    }


    forInput() {
        return Object.assign({}, this, {
            coinType: { id: this.coinType?.id || null, projectId: this.coinType?.projectId || "" },
            mintRegion: { id: this.mintRegion?.id || null, name: this.mintRegion?.name || "" },
            epoch: { id: this.epoch?.id || null, name: this.epoch?.name || "" },
            nominal: { id: this.nominal?.id || null, name: this.nominal?.name || "" },
            material: { id: this.material?.id || null, name: this.material?.name || "" },
            
            person: { id: this.person?.id || null, name: this.person?.name || "" },
            historicalRegion: { id: this.historicalRegion?.id || null, name: this.historicalRegion?.name || "" },
            issuingState: { id: this.issuingState?.id || null, name: this.issuingState?.name || "" },
        })
    }

    static fromInputs(obj) {
        obj = Object.assign({}, obj, {
            count: parseInt(obj.count),
            weight: parseFloat(obj.weight),
            year: parseInt(obj.year),
            coinType: obj.coinType.hasOwnProperty("id") ? obj.coinType.id : obj.coinType,
            mintRegion: obj.mintRegion.hasOwnProperty("id") ? obj.mintRegion.id : obj.mintRegion,
            epoch: obj.epoch.hasOwnProperty("id") ? obj.epoch.id : obj.epoch,
            nominal: obj.nominal.hasOwnProperty("id") ? obj.nominal.id : obj.nominal,
            material: obj.material.hasOwnProperty("id") ? obj.material.id : obj.material,

            person: obj.person.hasOwnProperty("id") ? obj.person.id : obj.person,
            historicalRegion: obj.historicalRegion.hasOwnProperty("id") ? obj.historicalRegion.id : obj.historicalRegion,
            issuingState: obj.issuingState.hasOwnProperty("id") ? obj.issuingState.id : obj.issuingState,
        })

        return new OttomanTreasureItem(obj)
    }
}