const { FRENCH, GERMAN } = require('./dynasty.mock')
const { CUTTER, DAULA, CALIPH } = require('./role.mock')

const UDERZO = {
    "id": "12",
    "name": "Albert Uderzo",
    "shortName": "Uderzo",
    "role": {
        "id": "2",
        "name": "cutter"
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#FFFF00"
}

const DUERER = {
    "id": "5",
    "name": "Albrecht Dürer",
    "shortName": "Dürer",
    "role": {
        "id": "2",
        "name": "cutter"
    },
    "dynasty": {
        "id": "1",
        "name": "Deutsche"
    },
    "color": "#FF00FF"
}

const MERKEL = {
    "id": "2",
    "name": "Angela Merkel",
    "shortName": "Merkel",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "1",
        "name": "Deutsche"
    },
    "color": "#0000FF"
}

const ARIELLE = {
    "id": "22",
    "name": "Arielle",
    "shortName": "Ari",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "5",
        "name": "Atlant"
    },
    "color": "#FF0000"
}

const CHARLES_DE_GAULLE = {
    "id": "10",
    "name": "Charles de Gaulle",
    "shortName": "de Gaulle",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#DDDD00"
}

const ELIZABETH_II = {
    "id": "15",
    "name": "Elizabeth II",
    "shortName": "The Queen",
    "role": {
        "id": "1",
        "name": "caliph"
    },
    "dynasty": {
        "id": "3",
        "name": "Briten"
    },
    "color": "#DDDDFF"
}

const MACRON = {
    "id": "6",
    "name": "Emmanuel Macron",
    "shortName": "Macron",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#00CC0F"
}

const FISCH = {
    "id": "20",
    "name": "Fisch",
    "shortName": null,
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "5",
        "name": "Atlant"
    },
    "color": "#0000FF"
}

const HOLLANDE = {
    "id": "7",
    "name": "François Hollande",
    "shortName": "Hollande",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#58ecF0"
}

const BERNINI = {
    "id": "25",
    "name": "Gian Lorenzo Bernini",
    "shortName": "Bernini",
    "role": {
        "id": "2",
        "name": "cutter"
    },
    "dynasty": {
        "id": "5",
        "name": "Atlant"
    },
    "color": "#AB87DF"
}

const WESTERWELLE = {
    "id": "17",
    "name": "Guido Westerwelle",
    "shortName": "Westerwelle",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "1",
        "name": "Deutsche"
    },
    "color": "#DD33FF"
}

const KOHL = {
    "id": "1",
    "name": "Helmut Kohl",
    "shortName": "Kohl",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "1",
        "name": "Deutsche"
    },
    "color": "#111111"
}

const CHIRAC = {
    "id": "9",
    "name": "Jaques Chirac",
    "shortName": "Chirac",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#FF1996"
}


const GAUCK = {
    "id": "3",
    "name": "Joachim Gauck",
    "shortName": "Gauck",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "1",
        "name": "Deutsche"
    },
    "color": "#EE3333"
}

const KARL = {
    "id": "4",
    "name": "Karl der Große",
    "shortName": "Karl",
    "role": {
        "id": "1",
        "name": "caliph"
    },
    "dynasty": {
        "id": "1",
        "name": "Deutsche"
    },
    "color": "#F3C3A3"
}

const LOUIS = {
    "id": "11",
    "name": "Louis XVI",
    "shortName": "Louis",
    "role": {
        "id": "1",
        "name": "caliph"
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#3333FF"
}

const MICHELANGELO = {
    "id": "24",
    "name": "Michelangelo",
    "shortName": "Miquel",
    "role": {
        "id": "2",
        "name": "cutter"
    },
    "dynasty": {
        "id": "5",
        "name": "Atlant"
    },
    "color": "#3FF3FF"
}

const SARKOZY = {
    "id": "8",
    "name": "Nicolas Sarkozy",
    "shortName": "Sarkozy",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#EECCAA"
}

const PLANKTON = {
    "id": "19",
    "name": "Plankton",
    "shortName": "Planki",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "5",
        "name": "Atlant"
    },
    "color": "#11FFAA"
}

const POSEIDON = {
    "id": "18",
    "name": "Poseidon",
    "shortName": "Neptun",
    "role": {
        "id": "1",
        "name": "caliph"
    },
    "dynasty": {
        "id": "5",
        "name": "Atlant"
    },
    "color": "#99FFAA"
}

const GOSCINNY = {
    "id": "13",
    "name": "René Goscinny",
    "shortName": "Goscinny",
    "role": {
        "id": "2",
        "name": "cutter"
    },
    "dynasty": {
        "id": "2",
        "name": "Franzosen"
    },
    "color": "#FE0101"
}

const SEBASTIAN = {
    "id": "23",
    "name": "Sebastian",
    "shortName": "Sebi",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": null,
        "name": null
    },
    "color": "#DD0101"
}

const WAL = {
    "id": "21",
    "name": "Wal",
    "shortName": null,
    "role": {
        "id": "2",
        "name": "cutter"
    },
    "dynasty": {
        "id": "5",
        "name": "Atlant"
    },
    "color": "#222222"
}

const TURNER = {
    "id": "16",
    "name": "William Turner",
    "shortName": "Turner",
    "role": {
        "id": "2",
        "name": "cutter"
    },
    "dynasty": {
        "id": "3",
        "name": "Briten"
    },
    "color": "#555555"
}

const CHURCHILL = {
    "id": "14",
    "name": "Winston Churchill",
    "shortName": "Churchill",
    "role": {
        "id": null,
        "name": null
    },
    "dynasty": {
        "id": "3",
        "name": "Briten"
    },
    "color": "#004433"
}
const PERSON_GQL_BODY = `{
    id
    name
    shortName
    role {
        id
        name
    }
    dynasty {
        id
        name
    }
    color
}`

const MONET_INPUT = `data: {name:"Claude Monet", shortName: "Monet", role: 2, dynasty:2, color: "#004433"}`

const MONET = {
    "id": "26",
    "name": "Claude Monet",
    "shortName": "Monet",
    "role": CUTTER,
    "dynasty": FRENCH,
    "color": "#004433"
}

const MONET_UPDATED = {
    "id": "26",
    "name": "Édouard Manet",
    "shortName": "Manet",
    "role": CALIPH,
    "dynasty": GERMAN,
    "color": "#ffeeaa"
}

const MONET_UPDATED_INPUT = `data: {
    name: "${MONET_UPDATED.name}"
    shortName: "${MONET_UPDATED.shortName}"
    role: ${MONET_UPDATED.role.id}
    dynasty: ${MONET_UPDATED.dynasty.id}
    color: "#ffeeaa"
}`

module.exports = {
    ARIELLE,
    BERNINI,
    CHARLES_DE_GAULLE,
    CHIRAC,
    CHURCHILL,
    DUERER,
    ELIZABETH_II,
    FISCH,
    GAUCK,
    GOSCINNY,
    HOLLANDE,
    KARL,
    KOHL,
    LOUIS,
    MACRON,
    MERKEL,
    MICHELANGELO,
    MONET,
    MONET_INPUT,
    MONET_UPDATED,
    MONET_UPDATED_INPUT,
    PERSON_GQL_BODY,
    PLANKTON,
    POSEIDON,
    SARKOZY,
    SEBASTIAN,
    TURNER,
    UDERZO,
    WAL,
    WESTERWELLE,
}
