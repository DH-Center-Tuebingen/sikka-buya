
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

        singleFind = null,
        reliableAttribution = null,
        completeHoard = null,
        ottomanPredominance = null,
        subclassification = null,
        collection = null,
        publication = null,
        yearOfLoss = { from: null, to: null },
        yearOfLossUncertain = { from: false, to: false },

    } = {}) {
        this.id = id
        this.name = name
        this.description = description
        this.location = location
        this.timespan = timespan
        this.items = items
        this.color = color
        this.singleFind = singleFind
        this.reliableAttribution = reliableAttribution
        this.completeHoard = completeHoard
        this.ottomanPredominance = ottomanPredominance
        this.subclassification = subclassification
        this.collection = collection
        this.publication = publication
        this.yearOfLoss = yearOfLoss
        this.yearOfLossUncertain = yearOfLossUncertain
    }

    async upsert() {
        const id = parseInt(this.id)
        if (!isNaN(id) && id > 0) {
            this.add()
        } else {
            this.update()
        }
    }

    async list() {
        const result = await new Query("treasure")
            .list([
                "id",
                "name",
                "location",
                "description",
                "color",
                "singleFind",
                "typeOfFindUncertain",
                "reliableAttribution",
                "completeHoard",
                "ottomanPredominance",
                "subclassification",
                "count",
                "collection",
                "publication",
                { yearOfLoss: ["from", "to"] },
                { yearOfLossUncertain: ["from", "to"] },


                { timespan: ["from", "to"] },
                {
                    items: [
                        "id",
                        "count",
                        "year",
                        "weight",
                        "coinTypeText",
                        { "mintRegion": ["id", "name", "location"] },
                        { epoch: ["id", "name"] },

                        "denominationText",
                        { nominal: ["id", "name"] },
                        "typeOfDenomination",
                        "denominationUncertain",

                        { material: ["id", "name"] },
                        "materialUncertain",

                        "uncertainYear",
                        "mintRegionUncertain",
                        "fragment",
                        "reconstructed",
                        "mintAsOnCoin",

                        "authenticity",

                        { person: ["id", "name"] },
                        "personUncertain",

                        { historicalRegion: ["id", "name"] },
                        { issuingState: ["id", "name"] },
                        "stateUncertain",
                        { issuingStateRegion: ["id", "name"] },


                        { yearOfMint: ["from", "to"] },
                        { yearOfMintUncertain: ["from", "to"] },
                    ]
                }
            ])

        return result.map(treasure => {
            const yearOfLossWithUncertainty = {
                from: treasure.yearOfLoss?.from,
                to: treasure.yearOfLoss?.to,
                fromUncertain: treasure.yearOfLossUncertain?.from,
                toUncertain: treasure.yearOfLossUncertain?.to,
            }

            treasure.yearOfLoss = yearOfLossWithUncertainty
            delete treasure.yearOfLossUncertain

            return treasure
        })
    }

    async get(id) {
        const result = await (new Query("treasure"))
            .get(id, [
                "id",
                "name",
                "location",
                "description",
                "color",
                "singleFind",
                "typeOfFindUncertain",
                "reliableAttribution",
                "completeHoard",
                "ottomanPredominance",
                "subclassification",
                "count",
                "collection",
                "publication",
                { yearOfLoss: ["from", "to"] },
                { yearOfLossUncertain: ["from", "to"] },

                { timespan: ["from", "to"] },
                {
                    items: [
                        "id",
                        "count",
                        "year",
                        "weight",
                        "coinTypeText",
                        { "mintRegion": ["id", "name", "location"] },
                        { epoch: ["id", "name"] },

                        "denominationText",
                        { nominal: ["id", "name"] },
                        "typeOfDenomination",
                        "denominationUncertain",

                        { material: ["id", "name"] },
                        "materialUncertain",

                        "uncertainYear",
                        "mintRegionUncertain",
                        "fragment",
                        "reconstructed",
                        "mintAsOnCoin",

                        "authenticity",

                        { person: ["id", "name"] },
                        "personUncertain",

                        { historicalRegion: ["id", "name"] },
                        { issuingState: ["id", "name"] },
                        "stateUncertain",
                        { issuingStateRegion: ["id", "name"] },


                        { yearOfMint: ["from", "to"] },
                        { yearOfMintUncertain: ["from", "to"] },
                    ]
                }
            ])

        const yearOfLossWithUncertainty = {
            from: result.yearOfLoss?.from,
            to: result.yearOfLoss?.to,
            fromUncertain: result.yearOfLossUncertain?.from,
            toUncertain: result.yearOfLossUncertain?.to,
        }

        result.yearOfLoss = yearOfLossWithUncertainty
        delete result.yearOfLossUncertain

        return result

    }

    fixLocation(location) {

        let coordinates = location?.coordinates || location?.geometry?.coordinates || []

        if (!Array.isArray(coordinates)) return null
        let flat = coordinates.flat(Infinity)
        if (flat.length === 0) return null

        return location
    }

    getMutationData() {
        return {
            name: this.name,
            location: this.fixLocation(this.location),
            description: this.description,
            color: this.color,
            timespan: this.timespan,
            items: this.items,
            singleFind: this.singleFind,
            typeOfFindUncertain: this.typeOfFindUncertain,
            reliableAttribution: this.reliableAttribution,
            completeHoard: this.completeHoard,
            ottomanPredominance: this.ottomanPredominance,
            subclassification: this.subclassification,
            collection: this.collection,
            publication: this.publication,
            yearOfLoss: this.yearOfLoss,
            yearOfLossUncertain: this.yearOfLossUncertain,
        }
    }

    async add() {
        await Query.raw(`
        mutation addTreasure($treasure: TreasureInput!) {
            addTreasure(data: $treasure)
        }
        `, {
            treasure: this.getMutationData()
        }, true)
    }

    async update(id) {
        await Query.raw(`
        mutation updateTreasure($id:ID!, $treasure: TreasureInput!) {
            updateTreasure(id:$id, data: $treasure)
        }
        `, {
            id,
            treasure: this.getMutationData()
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
     * @param {string} [options.coinTypeText=""] - The text of the coin type.
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
        coinTypeText = "",
        count = 1,
        epoch = null,
        fragment = false,
        id = null,
        material = null,
        materialUncertain = false,
        mintRegion = null,

        denominationText = "",
        nominal = null,
        typeOfDenomination = "",
        denominationUncertain = false,

        mintRegionUncertain = false,
        uncertainYear = null,
        weight = null,
        year = null,
        mintAsOnCoin = null,
        reconstructed = false,

        authenticity = null,

        person = { from: null, to: null },
        personUncertain = false,

        historicalRegion = { from: null, to: null },
        issuingState = { from: null, to: null },
        stateUncertain = false,
        issuingStateRegion = { from: null, to: null },

        yearOfMint = null,
        yearOfMintUncertain = null,
    } = {}
    ) {
        this.coinType = coinType
        this.coinTypeText = coinTypeText
        this.count = count
        this.epoch = epoch
        this.fragment = fragment
        this.id = id
        this.material = material
        this.materialUncertain = materialUncertain

        this.mintRegion = mintRegion
        this.mintRegionUncertain = mintRegionUncertain

        this.nominal = nominal
        this.denominationText = denominationText,
            this.typeOfDenomination = typeOfDenomination
        this.denominationUncertain = denominationUncertain

        this.uncertainYear = uncertainYear
        this.weight = weight
        this.year = year
        this.mintAsOnCoin = mintAsOnCoin
        this.reconstructed = reconstructed

        this.authenticity = authenticity

        this.person = person
        this.personUncertain = personUncertain

        this.historicalRegion = historicalRegion
        this.issuingState = issuingState
        this.stateUncertain = stateUncertain
        this.issuingStateRegion = issuingStateRegion

        this.yearOfMint = yearOfMint
        this.yearOfMintUncertain = yearOfMintUncertain
    }

    static rowDefinition() {
        return [
            { type: 'index', label: '#', attribute: null },

            { type: 'model', label: 'Issuing State', attribute: 'issuingState' },
            { type: 'boolean', label: 'sta. ?', attribute: 'stateUncertain' },
            { type: 'model', label: 'Issuing State Region', attribute: 'issuingStateRegion' },

            { type: 'model', label: 'Material', attribute: 'material' },
            { type: 'boolean', label: 'mat. ?', attribute: 'materialUncertain' },

            { type: 'model', label: 'Denomination', attribute: 'nominal' },
            { type: 'boolean', label: 'denom. ?', attribute: 'denominationUncertain' },
            { type: 'text', label: 'Denom. Text', attribute: 'denominationText' },
            { type: 'text', label: 'Denom. Pie Chart', attribute: 'typeOfDenomination' },

            { type: 'model', label: 'Issuer', attribute: 'person' },
            { type: 'boolean', label: 'is. ?', attribute: 'personUncertain' },

            { type: 'range', label: 'Year Of Minting', attribute: 'yearOfMint' },


            { type: 'model', label: 'Mint', attribute: 'mintRegion' },
            { type: 'boolean', label: 'mi. ?', attribute: 'mintRegionUncertain' },

            { type: 'text', label: 'Authenticity', attribute: 'authenticity' },
            { type: 'number', label: 'Quantity', attribute: 'count' },

            { type: 'text', label: 'Coin Type', attribute: 'coinTypeText' },

        ];
    }


    forInput() {
        return Object.assign({}, this, {
            mintRegion: { id: this.mintRegion?.id || null, name: this.mintRegion?.name || "" },
            epoch: { id: this.epoch?.id || null, name: this.epoch?.name || "" },
            nominal: { id: this.nominal?.id || null, name: this.nominal?.name || "" },
            material: { id: this.material?.id || null, name: this.material?.name || "" },

            person: { id: this.person?.id || null, name: this.person?.name || "" },
            historicalRegion: { id: this.historicalRegion?.id || null, name: this.historicalRegion?.name || "" },
            issuingState: { id: this.issuingState?.id || null, name: this.issuingState?.name || "" },
            issuingStateRegion: { id: this.issuingStateRegion?.id || null, name: this.issuingStateRegion?.name || "" },
            yearOfMint: { from: this.yearOfMint?.from || null, to: this.yearOfMint?.to || null, fromUncertain: this.yearOfMintUncertain?.from ?? false, toUncertain: this.yearOfMintUncertain?.to ?? false },
        })
    }

    static fromInputs(obj) {

        const yearOfLoss = Object.assign({}, obj.yearOfLoss);
        const yearOfMint = Object.assign({}, obj.yearOfMint);
        const sanitizedObject = Object.assign({}, obj, {
            count: parseInt(obj.count),
            weight: parseFloat(obj.weight),
            year: parseInt(obj.year),
            coinTypeText: obj.coinTypeText || "",
            mintRegion: obj.mintRegion.hasOwnProperty("id") ? obj.mintRegion.id : obj.mintRegion,
            epoch: obj.epoch.hasOwnProperty("id") ? obj.epoch.id : obj.epoch,
            nominal: obj.nominal.hasOwnProperty("id") ? obj.nominal.id : obj.nominal,
            material: obj.material.hasOwnProperty("id") ? obj.material.id : obj.material,

            person: obj.person.hasOwnProperty("id") ? obj.person.id : obj.person,
            historicalRegion: obj.historicalRegion.hasOwnProperty("id") ? obj.historicalRegion.id : obj.historicalRegion,
            issuingState: obj.issuingState.hasOwnProperty("id") ? obj.issuingState.id : obj.issuingState,
            issuingStateRegion: obj.issuingStateRegion.hasOwnProperty("id") ? obj.issuingStateRegion.id : obj.issuingStateRegion,

            yearOfMint: yearOfMint ? { from: parseInt(yearOfMint.from), to: parseInt(yearOfMint.to) } : null,
            yearOfMintUncertain: yearOfMint ? { from: !!yearOfMint.fromUncertain, to: !!yearOfMint.toUncertain } : null,
        })

        return new OttomanTreasureItem(sanitizedObject)
    }
}