

const { PI, U, A, E, EURO } = require('./coinmark.mock')
const { ARABIC, KORAN30, KORAN9 } = require('./coinverse.mock')
const { BLACK_GIANT, PEAR, OF_GERMANY, BULLDOZER, FRANCAIS, GENERAL, MERMAID, CREATURE_OF_THE_SEA, THE_GREAT } = require('./honorific.mock')
const { GOLD, SILVER, PERLMUTT } = require('./material.mock')
const { MARK, TALER, ADIE } = require('./nominal.mock')
const { KOHL,
    WESTERWELLE,
    MERKEL,
    DUERER,
    KARL,
    CHIRAC,
    CHARLES_DE_GAULLE,
    MACRON,
    HOLLANDE,
    SARKOZY,
    UDERZO,
    GOSCINNY,
    LOUIS,
    ARIELLE,
    SEBASTIAN,
    PLANKTON,
    FISCH,
    WAL,
    MICHELANGELO,
    BERNINI,
    POSEIDON,
    ELIZABETH_II,
    GAUCK
} = require('./person.mock')
const { PROF, DR, MONSIEUR, KOENIGIN, TIER, KOENIG } = require('./title.mock')



const GERMAN_TYPE = {
    "id": "1",
    "projectId": "GER1989",
    "treadwellId": "GD89",
    "mint": {
        "id": "1",
        "name": "Berlin",
        "location": { "type": "Point", "coordinates": [52.51968196, 13.376689258] },
        "uncertain": false,
        "uncertainArea": null
    },
    "mintAsOnCoin": "Börlin",
    "material": GOLD,
    "purity": 700,
    "nominal": MARK,
    "small": true,
    "yearOfMint": "1989",
    "donativ": true,
    "procedure": "pressed",
    "issuers": [
        Object.assign({
            "titles": [PROF, DR],
            "honorifics": [BLACK_GIANT, PEAR]
        }, KOHL)
    ],
    "overlords": [
        Object.assign({
            "rank": 1,
            "titles": [DR],
            "honorifics": [OF_GERMANY],
        }, WESTERWELLE),
        Object.assign({
            "rank": 2,
            "titles": [PROF],
            "honorifics": [BLACK_GIANT, OF_GERMANY]
        }, MERKEL)
    ],
    "otherPersons": [DUERER],
    "caliph": KARL,
    "avers": {
        "fieldText": "<div>Abbildung des deutschen Michels</div>",
        "innerInscript": "<div>Danach lasst uns alle streben</div>",
        "intermediateInscript": "<div>für das deutsche Vaterland!</div>",
        "outerInscript": "<div>Einigkeit und Recht und Freiheit</div>",
        "misc": "<div>Michel ohne Mütze</div>"
    },
    "reverse": {
        "fieldText": "<div>Abbildung eines Birnbaums</div>",
        "innerInscript": "<div>Und kam die goldene Herbsteszeit,</div>",
        "intermediateInscript": "<div>Ein Birnbaum in seinem Garten stand,</div>",
        "outerInscript": "<div>Herr von Ribbeck auf Ribbeck im Havelland,</div>",
        "misc": "<div>Birnbaum ohne Früchte</div>"
    },
    "cursiveScript": false,
    "coinMarks": [A, U, PI],
    "coinVerses": [
        ARABIC,
        KORAN30,
    ],
    "literature": "<div style=\" text - align: center;\">Av: Nationalhymne</div><div style=\" text - align: center;\">Rev. Gedicht Fontane</div>",
    "pieces": ["https://www.berlin.de/", "https://de.wikipedia.org/wiki/Berlin"],
    "specials": "<div style=\" text - align: center;\">Keine</div>",
    "excludeFromTypeCatalogue": false,
    "excludeFromMapApp": false,
    "internalNotes": null,
    "yearUncertain": false,
    "mintUncertain": false,
    "plain_text": "GER1989\\nGøld\\nBerlin\\n1 Mark\\nAbbildung des deutschen Michels\\nDanach lasst uns alle streben\\nfür das deutsche Vaterland!\\nEinigkeit und Recht und Freiheit\\nMichel ohne Mütze\\nAbbildung eines Birnbaums\\nUnd kam die goldene Herbsteszeit,\\nEin Birnbaum in seinem Garten stand,\\nHerr von Ribbeck auf Ribbeck im Havelland,\\nBirnbaum ohne Früchte\\nAv: NationalhymneRev. Gedicht Fontane\\nKeine"
}

const GERMAN_TYPE_WHEN_LOGGED_IN_DIFF = {
    "internalNotes": "<div style=\" text - align: center;\">Bitte nochmal neu!</div>",
    "plain_text": "GER1989\\nGøld\\nBerlin\\n1 Mark\\nAbbildung des deutschen Michels\\nDanach lasst uns alle streben\\nfür das deutsche Vaterland!\\nEinigkeit und Recht und Freiheit\\nMichel ohne Mütze\\nAbbildung eines Birnbaums\\nUnd kam die goldene Herbsteszeit,\\nEin Birnbaum in seinem Garten stand,\\nHerr von Ribbeck auf Ribbeck im Havelland,\\nBirnbaum ohne Früchte\\nAv: NationalhymneRev. Gedicht Fontane\\nKeine\\nBitte nochmal neu!"
}

const FRENCH_TYPE = {
    "id": "2",
    "projectId": "FRévô1789",
    "treadwellId": "FR1789",
    "mint": {
        "id": "2",
        "name": "Paris",
        "location": { "type": "Point", "coordinates": [48.863113497, 2.337794633] },
        "uncertain": false,
        "uncertainArea": null
    },
    "mintAsOnCoin": "Paris",
    "material": SILVER,
    "purity": null,
    "nominal": TALER,
    "small": false,
    "yearOfMint": "1789",
    "donativ": true,
    "procedure": "cast",
    "issuers": [
        Object.assign(
            {
                "titles": [PROF, DR, MONSIEUR],
                "honorifics": [BULLDOZER, FRANCAIS]
            }, CHIRAC),
        Object.assign({
            "titles": [MONSIEUR],
            "honorifics": [BULLDOZER, GENERAL]
        },
            CHARLES_DE_GAULLE)
    ],
    "overlords": [
        Object.assign({
            "rank": 1,
            "titles": [PROF, MONSIEUR],
            "honorifics": [OF_GERMANY],
        }, MACRON),
        Object.assign({
            "rank": 2,
            "titles": [DR, MONSIEUR],
            "honorifics": [FRANCAIS, BULLDOZER],
        }, HOLLANDE),
        Object.assign({
            "rank": 3,
            "titles": [MONSIEUR],
            "honorifics": [FRANCAIS],
        }, SARKOZY)
    ],
    "otherPersons": [
        UDERZO,
        GOSCINNY
    ],
    "caliph": LOUIS,
    "avers": {
        "fieldText": "<div>Abb. Französische Flagge</div>",
        "innerInscript": "<div>Contre nous de la tyrannie</div>",
        "intermediateInscript": "<div>Le jour de gloire est arrivé!</div>",
        "outerInscript": "<div>Allons enfants de la Patrie,</div>",
        "misc": "<div>Flagge wehend</div>"
    },
    "reverse": {
        "fieldText": "<div>Französischer Hahn</div>",
        "innerInscript": "<div>Fraternité</div>",
        "intermediateInscript": "<div>Égalité</div>",
        "outerInscript": "<div>Liberté</div>",
        "misc": "<div>Hahn trägt Hose</div>"
    },
    "cursiveScript": false,
    "coinMarks": [E, PI],
    "coinVerses": [KORAN9],
    "literature": "<div style=\" text - align: center;\">Av: Nationalhymne</div><div style=\" text - align: center;\">Rev. revolutionärer Asusspruch</div>",
    "pieces": [
        "https://de.wikipedia.org/wiki/Paris"
    ],
    "specials": "<div style=\" text - align: center;\">Revolutionsmünze mit König</div>",
    "excludeFromTypeCatalogue": false,
    "excludeFromMapApp": false,
    "internalNotes": null,
    "yearUncertain": true,
    "mintUncertain": true,
    "plain_text": "FRévô1789\\nSilber\\nParis\\n1 Taler\\nAbb. Französische Flagge\\nContre nous de la tyrannie\\nLe jour de gloire est arrivé!\\nAllons enfants de la Patrie,\\nFlagge wehend\\nFranzösischer Hahn\\nFraternité\\nÉgalité\\nLiberté\\nHahn trägt Hose\\nAv: NationalhymneRev. revolutionärer Asusspruch\\nRevolutionsmünze mit König"
}

FRENCH_TYPE_WHEN_LOGGED_IN_DIFF = {
    "internalNotes": "<div style=\" text - align: center;\">Bitte Überprüfen!</div>",
    "plain_text": "FRévô1789\\nSilber\\nParis\\n1 Taler\\nAbb. Französische Flagge\\nContre nous de la tyrannie\\nLe jour de gloire est arrivé!\\nAllons enfants de la Patrie,\\nFlagge wehend\\nFranzösischer Hahn\\nFraternité\\nÉgalité\\nLiberté\\nHahn trägt Hose\\nAv: NationalhymneRev. revolutionärer Asusspruch\\nRevolutionsmünze mit König\\nBitte Überprüfen!"
}

const GERMAN_TYPE_WHEN_LOGGED_IN = Object.assign({}, GERMAN_TYPE, GERMAN_TYPE_WHEN_LOGGED_IN_DIFF)
const FRENCH_TYPE_WHEN_LOGGED_IN = Object.assign({}, FRENCH_TYPE, FRENCH_TYPE_WHEN_LOGGED_IN_DIFF)

const ATLANTIS_TYPE = {
    "id": "3",
    "projectId": "ẲTLxxx",
    "treadwellId": "Ẳx",
    "mint": {
        "id": "3",
        "name": "Ǎtlantis",
        "location": { "type": "Point", "coordinates": [40.450505694, 6.15439645] },
        "uncertain": true,
        "uncertainArea": { "type": "Polygon", "coordinates": [[[5.2734375, 41.697525911], [3.779296875, 40.838749138], [5.438232422, 39.300299186], [6.877441406, 39.283293869], [7.492675781, 40.513799155], [6.701660156, 41.557921578], [5.2734375, 41.697525911]]] }
    },
    "mintAsOnCoin": "Ẳtlảntis",
    "material": PERLMUTT,
    "purity": 900,
    "nominal": ADIE,
    "small": true,
    "yearOfMint": "xxx",
    "donativ": true,
    "procedure": "cast",
    "issuers": [
        Object.assign({
            "titles": [KOENIGIN],
            "honorifics": [MERMAID, CREATURE_OF_THE_SEA]
        }, ARIELLE),
        Object.assign({
            "titles": [MONSIEUR, TIER],
            "honorifics": [CREATURE_OF_THE_SEA]
        }, SEBASTIAN)

    ],
    "overlords": [
        Object.assign(
            {
                "rank": 1,
                "titles": [MONSIEUR, TIER],
                "honorifics": [CREATURE_OF_THE_SEA, MERMAID]
            }, PLANKTON),
        Object.assign({
            "rank": 2,
            "titles": [TIER],
            "honorifics": [THE_GREAT, CREATURE_OF_THE_SEA]
        }, FISCH),
        Object.assign({
            "rank": 3,
            "titles": [TIER],
            "honorifics": [CREATURE_OF_THE_SEA]
        }, WAL)
    ],
    "otherPersons": [
        MICHELANGELO,
        BERNINI
    ],
    "caliph": POSEIDON,
    "avers": {
        "fieldText": "<div>Ein Mann in Lokführermontur vor einer Dampflokomotive.</div>",
        "innerInscript": "<div>Eine Insel mit zwei Bergen,</div>",
        "intermediateInscript": "<div>und dem tiefen weiten Meer,</div>",
        "outerInscript": "<div>mit viel Tunnels und Gleisen.</div>",
        "misc": "<div>Lokführer scheint an Fäden zu hängen.</div>"
    },
    "reverse": {
        "fieldText": "<div>Großes '₳'</div>",
        "innerInscript": "<div>Die Währung</div>",
        "intermediateInscript": "<div>des Landes</div>",
        "outerInscript": "<div>unter dem Meer.</div>",
        "misc": "<div>Jahreszahl unter '₳' nicht lesbar.</div>"
    },
    "cursiveScript": true,
    "coinMarks": [A, U, E],
    "coinVerses": [KORAN9, KORAN30],
    "literature": "<div>Keine Literatur vorhanden</div>",
    "pieces": [
        "https://de.wikipedia.org/wiki/Atlantis",
        "https://de.wikipedia.org/wiki/Poseidon"
    ],
    "specials": "<div>Einzige bekannte Münze aus Atlantis</div>",
    "excludeFromTypeCatalogue": true,
    "excludeFromMapApp": true,
    "internalNotes": "Ziemlich sicher eine Fäschung!",
    "yearUncertain": true,
    "mintUncertain": true,
    "plain_text": "ẲTLxxx\nPerlmutt\nǍtlantis\n₳die\nEin Mann in Lokführermontur vor einer Dampflokomotive.\nEine Insel mit zwei Bergen,\nund dem tiefen weiten Meer,\nmit viel Tunnels und Gleisen.\nLokführer scheint an Fäden zu hängen.\nGroßes '₳'\nDie Währung\ndes Landes\nunter dem Meer.\nJahreszahl unter '₳' nicht lesbar.\nKeine Literatur vorhanden\nEinzige bekannte Münze aus Atlantis\\nZiemlich sicher eine Fäschung!" //Somehow the last \\n needs 2 backslashes
}

const ATLANTIS_INPUT = `{
        projectId: "ẲTLxxx",
        treadwellId: "Ẳx",
        mint: 3,
        mintAsOnCoin: "Ẳtlảntis",
        material: 3,
        purity: 900,
        nominal: 1,
        small: true,
        yearOfMint: "xxx",
        donativ: true,
        procedure: "cast",
        issuers: [
          {
            person: 22,
            titles: [5],
            honorifics: [7, 9]
          }, {
            person: 23,
            titles: [3, 6],
            honorifics: [9]
          }
        ],
        overlords: [
          {
            person: 19,
            rank: 1,
            titles: [3, 6],
            honorifics: [9, 7],
          },
          {
            person: 20,
            rank: 2,
            titles: [6],
            honorifics: [8, 9],
          },
          {
            person: 21,
            rank: 3,
            titles: [6
            ],
            honorifics: [9
            ]
          }
        ],
        otherPersons: [
          24, 25
        ],
        caliph: 18,
        avers: {
          fieldText: "<div>Ein Mann in Lokführermontur vor einer Dampflokomotive.</div>",
          innerInscript: "<div>Eine Insel mit zwei Bergen,</div>",
          intermediateInscript: "<div>und dem tiefen weiten Meer,</div>",
          outerInscript: "<div>mit viel Tunnels und Gleisen.</div>",
          misc: "<div>Lokführer scheint an Fäden zu hängen.</div>"
        },
        reverse: {
          fieldText: "<div>Großes '₳'</div>",
          innerInscript: "<div>Die Währung</div>",
          intermediateInscript: "<div>des Landes</div>",
          outerInscript: "<div>unter dem Meer.</div>",
          misc: "<div>Jahreszahl unter '₳' nicht lesbar.</div>"
        },
        cursiveScript: true,
        coinMarks: [1, 3, 2],
        coinVerses: [1,3],
        literature: "<div>Keine Literatur vorhanden</div>",
        pieces: [
          "https://de.wikipedia.org/wiki/Atlantis",
          "https://de.wikipedia.org/wiki/Poseidon"
        ],
        specials: "<div>Einzige bekannte Münze aus Atlantis</div>",
        excludeFromTypeCatalogue: true,
        excludeFromMapApp: true,
        internalNotes: "Ziemlich sicher eine Fäschung!",
        yearUncertain: true,
        mintUncertain: true,
      }`

const ATLANTIS_INPUT_UPDATED = `{
        projectId: "ẲT",
        treadwellId: "Ẳ",
        mint: 1,
        mintAsOnCoin: "Ẳtl",
        material: 4,
        purity: 500,
        nominal: 3,
        small: false,
        yearOfMint: "100",
        donativ: false,
        procedure: "pressed",
        issuers: [
          {
            person: 1,
            titles: [2, 4],
            honorifics: [1, 2]
          },
          {
            person: 9,
            titles: [1, 3],
            honorifics: [4, 5]
          }
        ],
        overlords: [
          {
            person: 2,
            rank: 1,
            titles: [1, 2, 5],
            honorifics: [6, 8],
          },
          {
            person: 6,
            rank: 2,
            titles: [2],
            honorifics: [4]
          }
        ],
        otherPersons: [
          3, 5
        ],
        caliph: 15,
        avers: {
          fieldText: "<div>Dampflokomotive</div>",
          innerInscript: "<div>Bergen</div>",
          intermediateInscript: "<div>Meer</div>",
          outerInscript: "<div>Gleisen</div>",
          misc: "<div>Lokführer</div>"
        },
        reverse: {
          fieldText: "<div>₳</div>",
          innerInscript: "<div>Die</div>",
          intermediateInscript: "<div>des</div>",
          outerInscript: "<div>unter</div>",
          misc: "<div>nicht lesbar.</div>"
        },
        cursiveScript: false,
        coinMarks: [4, 5],
        coinVerses:[2],
        literature: "<div>vorhanden</div>",
        pieces: [
          "https://de.wikipedia.org/wiki/Pompeji"
        ],
        specials: "<div>Eis</div>",
        excludeFromTypeCatalogue: false,
        excludeFromMapApp: false,
        internalNotes: "Fäschung!",
        yearUncertain: false,
        mintUncertain: false,
      }`


const ATLANTIS_TYPE_UPDATED = {
    "id": "3",
    "projectId": "ẲT",
    "treadwellId": "Ẳ",
    "mint": {
        "id": "1",
        "name": "Berlin",
        "location": { "type": "Point", "coordinates": [52.51968196, 13.376689258] },
        "uncertain": false,
        "uncertainArea": null
    },
    "mintAsOnCoin": "Ẳtl",
    "material": SILVER,
    "purity": 500,
    "nominal": TALER,
    "small": false,
    "yearOfMint": "100",
    "donativ": false,
    "procedure": "pressed",
    "issuers": [
        Object.assign({
            "titles": [DR, KOENIG],
            "honorifics": [BLACK_GIANT, PEAR]
        }, KOHL),
        Object.assign({
            "titles": [PROF, MONSIEUR],
            "honorifics": [FRANCAIS, GENERAL],
        }, CHIRAC)
    ],
    "overlords": [
        Object.assign({
            "rank": 1,
            "titles": [PROF, DR, KOENIGIN],
            "honorifics": [OF_GERMANY, THE_GREAT]
        }, MERKEL),
        Object.assign({
            "rank": 2,
            "titles": [DR],
            "honorifics": [FRANCAIS]
        }, MACRON)
    ],
    "otherPersons": [
        GAUCK, DUERER
    ],
    "caliph": ELIZABETH_II,
    "avers": {
        "fieldText": "<div>Dampflokomotive</div>",
        "innerInscript": "<div>Bergen</div>",
        "intermediateInscript": "<div>Meer</div>",
        "outerInscript": "<div>Gleisen</div>",
        "misc": "<div>Lokführer</div>"
    },
    "reverse": {
        "fieldText": "<div>₳</div>",
        "innerInscript": "<div>Die</div>",
        "intermediateInscript": "<div>des</div>",
        "outerInscript": "<div>unter</div>",
        "misc": "<div>nicht lesbar.</div>"
    },
    "cursiveScript": false,
    "coinMarks": [PI, EURO],
    "coinVerses": [ARABIC],
    "literature": "<div>vorhanden</div>",
    "pieces": [
        "https://de.wikipedia.org/wiki/Pompeji"
    ],
    "specials": "<div>Eis</div>",
    "excludeFromTypeCatalogue": false,
    "excludeFromMapApp": false,
    "internalNotes": "Fäschung!",
    "yearUncertain": false,
    "mintUncertain": false,
    "plain_text": "ẲT\nSilber\nBerlin\n1 Taler\nDampflokomotive\nBergen\nMeer\nGleisen\nLokführer\n₳\nDie\ndes\nunter\nnicht lesbar.\nvorhanden\nEis\\nFäschung!"
}


const COIN_TYPE_BODY = ` 
id
projectId
treadwellId
mint {
  id
  name
  location
  uncertain
  uncertainArea
}
mintAsOnCoin
nominal {
  id
  name
}
material {
  id
  name
  color
}
purity
yearOfMint
donativ
procedure
issuers {
  id
  titles {
    id
    name
  }
  honorifics {
    id
    name
  }
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
}
overlords {
  id
  rank
  name
  titles {
    id
    name
  }
  honorifics {
    id
    name
  }
  dynasty {
    id
    name
  }
  shortName
  role {
    id
    name
  }
  color
}
otherPersons {
  id
  name
  shortName
  role {
    id
    name
  }
  dynasty{
      id,
      name
    }
  color
}
caliph {
  id
  name
  shortName
  role {
    id
    name
  }
  dynasty{id,name}
  color
}
avers {
  fieldText
  innerInscript
  intermediateInscript
  outerInscript
  misc
}
reverse {
  fieldText
  innerInscript
  intermediateInscript
  outerInscript
  misc
}
cursiveScript
coinMarks {
  id
  name
}
coinVerses {
  id
  name
}
small
literature
pieces
specials
excludeFromTypeCatalogue
excludeFromMapApp
internalNotes
yearUncertain
mintUncertain
plain_text
`



module.exports = {
    COIN_TYPE_BODY,
    GERMAN_TYPE,
    FRENCH_TYPE,
    GERMAN_TYPE_WHEN_LOGGED_IN,
    FRENCH_TYPE_WHEN_LOGGED_IN,
    ATLANTIS_TYPE,
    ATLANTIS_INPUT,
    ATLANTIS_INPUT_UPDATED,
    ATLANTIS_TYPE_UPDATED,
}