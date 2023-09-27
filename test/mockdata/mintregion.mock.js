

const GERMANY_REGION = {
    id: "1",
    name: "Germany",
    uncertain: false,
    location: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [52.51, 13.37]
        },
        properties: {
            radius: 20000
        }
    }
}

const PARIS_REGION = {
    id: "2",
    name: "Paris",
    uncertain: false,
    location: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [48.86, 2.33]
        },
        properties: {
            radius: 10000
        }
    }
}

const ATLANTIS_REGION = {
    id: "3",
    name: "Ǎtlantis",
    uncertain: true,
    location: {
        type: "Polygon",
        coordinates: [[[5.27, 41.69], [3.77, 40.83], [5.43, 39.30], [6.87, 39.28], [7.49, 40.51], [6.70, 41.55], [5.27, 41.69]]]
    }
}

const CONSTANTINOPLE_REGION = {
    id: "4",
    name: "Constantinople",
    uncertain: true,
    location: {
        type: "Polygon",
        coordinates: [[[28.61, 40.87], [28.88, 40.73], [28.88, 40.72], [29.47, 40.73], [29.47, 40.99], [29.11, 41.20], [28.61, 40.87]]]
    }
}

const CONSTANTINOPLE_REGION_UPDATED = {
    id: "4",
    name: "Byzanz",
    uncertain: false,
    location: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [41.02, 28.88]
        },
        properties: {
            radius: 20000
        }
    }
}

const CONSTANTINOPLE_REGION_UPDATED_INPUT = `data: {
    name: "Byzanz",
    uncertain: false,
    location: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [41.02, 28.88]
        },
        properties: {
            radius: 20000
        }
    }
}`

const TEST_MINT_REGION_INPUT = `data: {
    name: "Test Mint Region",
    uncertain: true,
    location: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [10, 33]
        },
        properties: {
            radius: 100
        }
    }
}`

const TEST_MINT_REGION_DATA = {
    id: "5",
    name: "Test Mint Region",
    uncertain: true,
    location: {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [10, 33]
        },
        properties: {
            radius: 100
        }
    }
}

const MINT_REGION_GQL_BODY = `{
    id
    name
    uncertain
    location
}`


module.exports = {
    // Data:
    ATLANTIS_REGION,
    CONSTANTINOPLE_REGION,
    GERMANY_REGION,
    PARIS_REGION,

    // Alternated Data:
    TEST_MINT_REGION_DATA,
    TEST_MINT_REGION_INPUT,
    CONSTANTINOPLE_REGION_UPDATED,
    CONSTANTINOPLE_REGION_UPDATED_INPUT,

    // Utils:
    MINT_REGION_GQL_BODY
}