const { GERMANY, THE_SEA, FRANCE, ROMAN_EMPIRE, TURKEY } = require('./province.mock')

const ATLANTIS = {
    "id": "3",
    "name": "Ǎtlantis",
    "location": { type: "Point", coordinates: [40.450505694, 6.15439645] },
    "uncertain": true,
    "uncertainArea": { type: "Polygon", coordinates: [[[5.2734375, 41.697525911], [3.779296875, 40.838749138], [5.438232422, 39.300299186], [6.877441406, 39.283293869], [7.492675781, 40.513799155], [6.701660156, 41.557921578], [5.2734375, 41.697525911]]] },
    "province": THE_SEA
}

const BERLIN =
{
    "id": "1",
    "name": "Berlin",
    "location": { type: "Point", coordinates: [52.51968196, 13.376689258] },
    "uncertain": false,
    "uncertainArea": null,
    "province": GERMANY

}

const PARIS = {
    "id": "2",
    "name": "Paris",
    "location": { type: "Point", coordinates: [48.863113497, 2.337794633] },
    "uncertain": false,
    "uncertainArea": null,
    "province": FRANCE
}

const ISTANBUL = {
    id: "4",
    name: "Constantinople",
    uncertain: true,
    uncertainArea: {
        "coordinates": [
            [
                [
                    28.6101,
                    40.8729
                ],
                [
                    28.8800,
                    40.7317
                ],
                [
                    28.8800,
                    40.7200
                ],
                [
                    29.4791,
                    40.7367
                ],
                [
                    29.4769,
                    40.9939
                ],
                [
                    29.1148,
                    41.2056
                ],
                [
                    28.6101,
                    40.8729
                ]
            ]
        ],
        "type": "Polygon"
    },
    location: {
        "coordinates": [28.6624, 41.1598],
        "type": "Point"
    },
    province: ROMAN_EMPIRE
}

const ISTANBUL_UPDATED = {
    id: "4",
    name: "Istanbul",
    uncertain: false,
    uncertainArea: {
        "coordinates": [
            [
                [
                    28.8926,
                    40.9981
                ],
                [
                    29.1019,
                    40.9586
                ],
                [
                    29.0967,
                    41.0770
                ],
                [
                    28.8926,
                    41.0849
                ],
                [
                    28.8926,
                    40.9981
                ]
            ]
        ],
        "type": "Polygon"
    },
    location: {
        "coordinates": [28.9711, 41.0139],
        "type": "Point"
    },
    province: TURKEY
}

const ISTANBUL_UPDATED_INPUT = `
data: {
    name: "Istanbul",
    uncertain: false,
    uncertainArea: {
        coordinates: [
            [
                [
                    28.8926,
                    40.9981
                ],
                [
                    29.1019,
                    40.9586
                ],
                [
                    29.0967,
                    41.0770
                ],
                [
                    28.8926,
                    41.0849
                ],
                [
                    28.8926,
                    40.9981
                ]
            ]
        ],
        type: "Polygon"
    },
    location: {
        coordinates: [28.9711, 41.0139],
        type: "Point"
    },
    province: 5
}`

const TEST_MINT_DATA = {
    "name": "Test",
    "id": "5",
    "location": { type: "Point", coordinates: [8, 49] },
    "uncertain": true,
    "uncertainArea": { type: "Polygon", coordinates: [[[7.0202, 50.9791], [6.7126, 49.1385], [9.0087, 48.9224], [9.1845, 50.9722], [7.0202, 50.9791]]] },
    "province": {
        "id": "1",
        "name": "France"
    }
}

const TEST_MINT_INPUT = `data: {
    name: "Test",
    location: {type:"Point",coordinates:[8,49]},
    uncertain: true,
    uncertainArea: {type:"Polygon",coordinates:[[[7.0202, 50.9791], [6.7126, 49.1385], [9.0087, 48.9224], [9.1845, 50.9722], [7.0202, 50.9791]]] }
    , province: 1
}`



const MINT_GQL_BODY = `{id,name,location , uncertain,uncertainArea, province {id, name}}`


module.exports = {
    ATLANTIS,
    BERLIN,
    ISTANBUL_UPDATED_INPUT,
    ISTANBUL_UPDATED,
    ISTANBUL,
    MINT_GQL_BODY,
    PARIS,
    TEST_MINT_DATA,
    TEST_MINT_INPUT,
}