
const {
    ALESIA_TREASURE_ITEM,
    ATLANTIS_TREASURE_ITEM,
    ATLANTIS_TREASURE_ITEM_INPUT,
    ATLANTIS_TWO_TREAURE_ITEM_INPUT,
    ATLANTIS_TWO_TREAURE_ITEM,
    GERMAN_TREASURE_ITEM,
    GERMAN_TWO_TREASURE_ITEM,
    FRENCH_TREASURE_ITEM,
    NEU_BERLIN_TREASURE_ITEM_INPUT,
    TREASURE_ITEM_GQL_BODY
} = require('./treasure-item.mock')

const CORUNA_DATA = {
    id: "2",
    name: "La Coruña",
    literature: "https://en.wikipedia.org/wiki/A_Coru%C3%B1a",
    timespan: {
        from: 20,
        to: 30
    },
    location: {
        type: "Point",
        coordinates: [
            -8.403,
            43.369
        ],
    },
    items: [
        GERMAN_TWO_TREASURE_ITEM
    ]
}

const UPDATED_LONDON_DATA_INPUT = `{
    name: "Ǎtlantis",
    literature: "https://en.wikipedia.org/wiki/Atlantis",
    timespan: {
        from: -300,
        to: 100
    },
    location: {
            coordinates: [
                [
                    [
                        29.70521,
                        35.29662
                    ],
                    [
                        29.70521,
                        34.78504
                    ],
                    [
                        30.31254,
                        34.78504
                    ],
                    [
                        30.31254,
                        35.29662
                    ],
                    [
                        29.70521,
                        35.29662
                    ]
                ]
            ],
            type: "Polygon"
    },
    items: [
       ${ATLANTIS_TREASURE_ITEM_INPUT},
       ${NEU_BERLIN_TREASURE_ITEM_INPUT}
    ]
}`


const UPDATED_LONDON_DATA = {
    id: "1",
    name: "Ǎtlantis",
    literature: "https://en.wikipedia.org/wiki/Atlantis",
    timespan: {
        from: -300,
        to: 100
    },
    location: {
        coordinates: [
            [
                [
                    29.70521,
                    35.29662
                ],
                [
                    29.70521,
                    34.78504
                ],
                [
                    30.31254,
                    34.78504
                ],
                [
                    30.31254,
                    35.29662
                ],
                [
                    29.70521,
                    35.29662
                ]
            ]
        ],
        type: "Polygon"
    },
    items: [
        ATLANTIS_TREASURE_ITEM,
        FRENCH_TREASURE_ITEM
    ]
}

const LONDON_DATA = {
    id: "1",
    name: "London",
    literature: "https://en.wikipedia.org/wiki/Londinium",
    timespan: {
        from: 100,
        to: 130
    },
    location: {
        type: "Polygon",
        coordinates: [
            [
                [
                    -0.121,
                    51.527
                ],
                [
                    -0.154,
                    51.497
                ],
                [
                    -0.088,
                    51.495
                ],
                [
                    -0.121,
                    51.527
                ]
            ]
        ]
    },
    items: [
        GERMAN_TREASURE_ITEM,
        ALESIA_TREASURE_ITEM
    ]
}

const LODZ_INPUT = `{
    name: "Łódź",
    literature: "https://en.wikipedia.org/wiki/%C5%81%C3%B3d%C5%BA",
    timespan: {
        from: 1089,
        to: 1200
    },
    location: {
        coordinates: [
            [
                [
                    19.393,
                    51.810
                ],
                [
                    19.393,
                    51.724
                ],
                [
                    19.534,
                    51.724
                ],
                [
                    19.534,
                    51.810
                ],
                [
                    19.393,
                    51.810
                ]
            ]
        ],
        type: "Polygon"
    }, items: [
       ${ATLANTIS_TWO_TREAURE_ITEM_INPUT}
    ]
}`

const LODZ_DATA = {
    id: "3",
    name: "Łódź",
    literature: "https://en.wikipedia.org/wiki/%C5%81%C3%B3d%C5%BA",
    timespan: {
        from: 1089,
        to: 1200
    },
    location: {
        coordinates: [
            [
                [
                    19.393,
                    51.810
                ],
                [
                    19.393,
                    51.724
                ],
                [
                    19.534,
                    51.724
                ],
                [
                    19.534,
                    51.810
                ],
                [
                    19.393,
                    51.810
                ]
            ]
        ],
        type: "Polygon"
    }, items: [
        ATLANTIS_TWO_TREAURE_ITEM
    ]
}

const START_DATA = [
    CORUNA_DATA,
    LONDON_DATA,
]



const TREASURE_GQL_BODY = `{
    id
    name
    location
    timespan {
        from
        to
    }
    literature
    items ${TREASURE_ITEM_GQL_BODY}
}`

module.exports = {
    CORUNA_DATA,
    LODZ_DATA,
    LODZ_INPUT,
    LONDON_DATA,
    START_DATA,
    TREASURE_GQL_BODY,
    UPDATED_LONDON_DATA_INPUT,
    UPDATED_LONDON_DATA,
}