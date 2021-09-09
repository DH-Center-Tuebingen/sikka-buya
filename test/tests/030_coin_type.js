const chai = require('chai')
const expect = chai.expect
const { graphql } = require('../helpers/graphql')
const TestUser = require('../helpers/test-user')

chai.config.truncateThreshold = 0
chai.config.showDiff = true

const body = ` 
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
material {
id
name
}
nominal {
id
name
}
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
}
otherPersons {
id
name
shortName
role {
id
name
}
dynasty{id,name}
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
literature
pieces
specials
excludeFromTypeCatalogue
excludeFromMapApp
internalNotes
yearUncertain
mintUncertain
`

describe(`Type Queries`, function () {
  it(`List`, async function () {
    let result = await graphql(`{coinType{${body}}}`)

    expect(result.data).to.deep.equal({
      "data": {
        "coinType": [
          GERMAN_TYPE,
          FRENCH_TYPE
        ]
      }
    })
  })

  it("Get", async function () {
    let result = await graphql(`
          {
              getCoinType(id:2) {
                  ${body}
              }
          }
  `)

    expect(result.data).to.deep.equal({
      "data": {
        "getCoinType": FRENCH_TYPE
      }
    })
  })

  it("Search with regular characters", async function () {
    let result = await graphql(`
          {searchType(text: "revo") {
              ${body}
            }}`)

    expect(result.data).to.deep.equal({
      "data": {
        "searchType": [
          FRENCH_TYPE
        ]
      }
    })
  })

  it("Search with exact characters", async function () {
    let result = await graphql(`
          {searchType(text: "Révô") {
              ${body}
            }}`)

    expect(result.data).to.deep.equal({
      "data": {
        "searchType": [
          FRENCH_TYPE
        ]
      }
    })
  })

  it("Unauthorized Add Rejected", async function () {
    let promise = graphql(`mutation{addCoinType(data: ${ATLANTIS_INPUT})}`)
    await expect(promise).to.be.rejectedWith(["401"])
  })

  it("Add", async function () {
    let promise = graphql(`mutation{addCoinType(data: ${ATLANTIS_INPUT})}`, {}, TestUser.users[0].token)
    await expect(promise).to.be.fulfilled
  })

  it("Add was successfull", async function () {
    let result = await graphql(`{coinType{${body}}}`)

    expect(result.data.data).to.deep.equal({
      "coinType": [
        ATLANTIS_TYPE,
        GERMAN_TYPE,
        FRENCH_TYPE,
      ]
    })
  })

  it("Unauthorized Update Rejected", async function () {
    let promise = graphql(`mutation{updateCoinType(id:3,data: ${ATLANTIS_INPUT_UPDATED} )}`)
    await expect(promise).to.be.rejectedWith(["401"])
  })

  it("Update", async function () {
    let promise = graphql(`mutation{updateCoinType(id:3,data:${ATLANTIS_INPUT_UPDATED})}`, {}, TestUser.users[0].token)
    await expect(promise).to.be.fulfilled
  })

  it("Updated Values are correct", async function () {
    let result = await graphql(`
          {
              getCoinType(id:3) {
                  ${body}
              }
          }`)

    expect(result.data.data.getCoinType).to.deep.equal(ATLANTIS_TYPE_UPDATED)
  })



})


const GERMAN_TYPE = {
  "id": "1",
  "projectId": "GER1989",
  "treadwellId": "GD89",
  "mint": {
    "id": "1",
    "name": "Berlin",
    "location": "{\"type\":\"Point\",\"coordinates\":[52.51968196,13.376689258]}",
    "uncertain": false,
    "uncertainArea": null
  },
  "mintAsOnCoin": "Börlin",
  "material": {
    "id": "1",
    "name": "Gøld"
  },
  "nominal": {
    "id": "2",
    "name": "1 Mark"
  },
  "yearOfMint": "1989",
  "donativ": true,
  "procedure": "pressed",
  "issuers": [
    {
      "id": "1",
      "titles": [
        {
          "id": "1",
          "name": "Prof."
        },
        {
          "id": "2",
          "name": "Dr."
        }
      ],
      "honorifics": [
        {
          "id": "1",
          "name": "der Schwarze Riese"
        },
        {
          "id": "2",
          "name": "die Birne"
        }
      ],
      "name": "Helmut Kohl",
      "shortName": "Kohl",
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": "1",
        "name": "Deutsche"
      }
    }
  ],
  "overlords": [
    {
      "id": "17",
      "rank": 1,
      "name": "Guido Westerwelle",
      "titles": [
        {
          "id": "2",
          "name": "Dr."
        }
      ],
      "honorifics": [
        {
          "id": "6",
          "name": "von Deutschland"
        }
      ],
      "dynasty": {
        "id": "1",
        "name": "Deutsche"
      },
      "shortName": "Westerwelle",
      "role": {
        "id": null,
        "name": null
      }
    },
    {
      "id": "2",
      "rank": 2,
      "name": "Angela Merkel",
      "titles": [
        {
          "id": "1",
          "name": "Prof."
        }
      ],
      "honorifics": [
        {
          "id": "1",
          "name": "der Schwarze Riese"
        },
        {
          "id": "6",
          "name": "von Deutschland"
        }
      ],
      "dynasty": {
        "id": "1",
        "name": "Deutsche"
      },
      "shortName": "Merkel",
      "role": {
        "id": null,
        "name": null
      }
    }
  ],
  "otherPersons": [
    {
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
      }
    }
  ],
  "caliph": {
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
    }
  },
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
  "coinMarks": [
    {
      "id": "1",
      "name": "Ä"
    },
    {
      "id": "2",
      "name": "Ü"
    },
    {
      "id": "4",
      "name": "π"
    }
  ],
  "literature": "<div style=\" text - align: center;\">Av: Nationalhymne</div><div style=\" text - align: center;\">Rev. Gedicht Fontane</div>",
  "pieces": ["https://www.berlin.de/", "https://de.wikipedia.org/wiki/Berlin"],
  "specials": "<div style=\" text - align: center;\">Keine</div>",
  "excludeFromTypeCatalogue": false,
  "excludeFromMapApp": false,
  "internalNotes": "<div style=\" text - align: center;\">Bitte nochmal neu!</div>",
  "yearUncertain": false,
  "mintUncertain": false
}

const FRENCH_TYPE = {
  "id": "2",
  "projectId": "FRévô1789",
  "treadwellId": "FR1789",
  "mint": {
    "id": "2",
    "name": "Paris",
    "location": "{\"type\":\"Point\",\"coordinates\":[48.863113497,2.337794633]}",
    "uncertain": false,
    "uncertainArea": null
  },
  "mintAsOnCoin": "Paris",
  "material": {
    "id": "4",
    "name": "Silber"
  },
  "nominal": {
    "id": "3",
    "name": "1 Taler"
  },
  "yearOfMint": "1789",
  "donativ": true,
  "procedure": "cast",
  "issuers": [
    {
      "id": "9",
      "titles": [
        {
          "id": "1",
          "name": "Prof."
        },
        {
          "id": "2",
          "name": "Dr."
        },
        {
          "id": "3",
          "name": "Monsieur"
        }
      ],
      "honorifics": [
        {
          "id": "3",
          "name": "bulldozer"
        },
        {
          "id": "4",
          "name": "le Français"
        }
      ],
      "name": "Jaques Chirac",
      "shortName": "Chirac",
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": "2",
        "name": "Franzosen"
      }
    },
    {
      "id": "10",
      "titles": [
        {
          "id": "3",
          "name": "Monsieur"
        }
      ],
      "honorifics": [
        {
          "id": "3",
          "name": "bulldozer"
        },
        {
          "id": "5",
          "name": "le générale"
        }
      ],
      "name": "Charles de Gaulle",
      "shortName": "de Gaulle",
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": "2",
        "name": "Franzosen"
      }
    }
  ],
  "overlords": [
    {
      "id": "6",
      "rank": 1,
      "name": "Emmanuel Macron",
      "titles": [
        {
          "id": "1",
          "name": "Prof."
        },
        {
          "id": "3",
          "name": "Monsieur"
        }
      ],
      "honorifics": [
        {
          "id": "6",
          "name": "von Deutschland"
        }
      ],
      "dynasty": {
        "id": "2",
        "name": "Franzosen"
      },
      "shortName": "Macron",
      "role": {
        "id": null,
        "name": null
      }
    },
    {
      "id": "7",
      "rank": 2,
      "name": "François Hollande",
      "titles": [
        {
          "id": "2",
          "name": "Dr."
        },
        {
          "id": "3",
          "name": "Monsieur"
        }
      ],
      "honorifics": [
        {
          "id": "4",
          "name": "le Français"
        },
        {
          "id": "3",
          "name": "bulldozer"
        }
      ],
      "dynasty": {
        "id": "2",
        "name": "Franzosen"
      },
      "shortName": "Hollande",
      "role": {
        "id": null,
        "name": null
      }
    },
    {
      "id": "8",
      "rank": 3,
      "name": "Nicolas Sarkozy",
      "titles": [
        {
          "id": "3",
          "name": "Monsieur"
        }
      ],
      "honorifics": [
        {
          "id": "4",
          "name": "le Français"
        }
      ],
      "dynasty": {
        "id": "2",
        "name": "Franzosen"
      },
      "shortName": "Sarkozy",
      "role": {
        "id": null,
        "name": null
      }
    }
  ],
  "otherPersons": [
    {
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
      }
    },
    {
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
      }
    }
  ],
  "caliph": {
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
    }
  },
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
  "coinMarks": [
    {
      "id": "3",
      "name": "ê"
    },
    {
      "id": "4",
      "name": "π"
    }
  ],
  "literature": "<div style=\" text - align: center;\">Av: Nationalhymne</div><div style=\" text - align: center;\">Rev. revolutionärer Asusspruch</div>",
  "pieces": [
    "https://de.wikipedia.org/wiki/Paris"
  ],
  "specials": "<div style=\" text - align: center;\">Revolutionsmünze mit König</div>",
  "excludeFromTypeCatalogue": false,
  "excludeFromMapApp": false,
  "internalNotes": "<div style=\" text - align: center;\">Unfug</div>",
  "yearUncertain": true,
  "mintUncertain": true
}

const ATLANTIS_TYPE = {
  "id": "3",
  "projectId": "ẲTLxxx",
  "treadwellId": "Ẳx",
  "mint": {
    "id": "4",
    "name": "Ǎtlantis",
    "location": "{\"type\":\"Point\",\"coordinates\":[40.450505694,6.15439645]}",
    "uncertain": true,
    "uncertainArea": "{\"type\":\"Polygon\",\"coordinates\":[[[5.2734375,41.697525911],[3.779296875,40.838749138],[5.438232422,39.300299186],[6.877441406,39.283293869],[7.492675781,40.513799155],[6.701660156,41.557921578],[5.2734375,41.697525911]]]}"
  },
  "mintAsOnCoin": "Ẳtlảntis",
  "material": {
    "id": "3",
    "name": "Perlmutt"
  },
  "nominal": {
    "id": "1",
    "name": "⅟₂ ₳die"
  },
  "yearOfMint": "xxx",
  "donativ": true,
  "procedure": "cast",
  "issuers": [
    {
      "id": "22",
      "titles": [
        {
          "id": "5",
          "name": "Königin"
        }
      ],
      "honorifics": [
        {
          "id": "7",
          "name": "Meerjungfrau"
        },
        {
          "id": "9",
          "name": "Wesen des Meeres"
        }
      ],
      "name": "Arielle",
      "shortName": "Ari",
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": "5",
        "name": "Atlant"
      }
    },
    {
      "id": "23",
      "titles": [
        {
          "id": "3",
          "name": "Monsieur"
        },
        {
          "id": "6",
          "name": "Tier"
        }
      ],
      "honorifics": [
        {
          "id": "9",
          "name": "Wesen des Meeres"
        }
      ],
      "name": "Sebastian",
      "shortName": "Sebi",
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": null,
        "name": null
      }
    }
  ],
  "overlords": [
    {
      "id": "19",
      "rank": 1,
      "name": "Plankton",
      "titles": [
        {
          "id": "3",
          "name": "Monsieur"
        },
        {
          "id": "6",
          "name": "Tier"
        }
      ],
      "honorifics": [
        {
          "id": "9",
          "name": "Wesen des Meeres"
        },
        {
          "id": "7",
          "name": "Meerjungfrau"
        }
      ],
      "dynasty": {
        "id": "5",
        "name": "Atlant"
      },
      "shortName": "Planki",
      "role": {
        "id": null,
        "name": null
      }
    },
    {
      "id": "20",
      "rank": 2,
      "name": "Fisch",
      "titles": [
        {
          "id": "6",
          "name": "Tier"
        }
      ],
      "honorifics": [
        {
          "id": "8",
          "name": "der Große"
        },
        {
          "id": "9",
          "name": "Wesen des Meeres"
        }
      ],
      "dynasty": {
        "id": "5",
        "name": "Atlant"
      },
      "shortName": null,
      "role": {
        "id": null,
        "name": null
      }
    },
    {
      "id": "21",
      "rank": 3,
      "name": "Wal",
      "titles": [
        {
          "id": "6",
          "name": "Tier"
        }
      ],
      "honorifics": [
        {
          "id": "9",
          "name": "Wesen des Meeres"
        }
      ],
      "dynasty": {
        "id": "5",
        "name": "Atlant"
      },
      "shortName": null,
      "role": {
        "id": "2",
        "name": "cutter"
      }
    }
  ],
  "otherPersons": [
    {
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
      }
    },
    {
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
      }
    }
  ],
  "caliph": {
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
    }
  },
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
  "coinMarks": [
    {
      "id": "1",
      "name": "Ä"
    },
    {
      "id": "2",
      "name": "Ü"
    },
    {
      "id": "3",
      "name": "ê"
    }
  ],
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
  "mintUncertain": true
}




const ATLANTIS_INPUT = `{
      projectId: "ẲTLxxx",
      treadwellId: "Ẳx",
      mint: 4,
      mintAsOnCoin: "Ẳtlảntis",
      material: 3,
      nominal: 1,
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
      nominal: 3,
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
    "location": "{\"type\":\"Point\",\"coordinates\":[52.51968196,13.376689258]}",
    "uncertain": false,
    "uncertainArea": null
  },
  "mintAsOnCoin": "Ẳtl",
  "material": {
    "id": "4",
    "name": "Silber"
  },
  "nominal": {
    "id": "3",
    "name": "1 Taler"
  },
  "yearOfMint": "100",
  "donativ": false,
  "procedure": "pressed",
  "issuers": [
    {
      "id": "1",
      "titles": [
        {
          "id": "2",
          "name": "Dr."
        },
        {
          "id": "4",
          "name": "König"
        }
      ],
      "honorifics": [
        {
          "id": "1",
          "name": "der Schwarze Riese"
        },
        {
          "id": "2",
          "name": "die Birne"
        }
      ],
      "name": "Helmut Kohl",
      "shortName": "Kohl",
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": "1",
        "name": "Deutsche"
      }
    },
    {
      "id": "9",
      "titles": [
        {
          "id": "1",
          "name": "Prof."
        },
        {
          "id": "3",
          "name": "Monsieur"
        }
      ],
      "honorifics": [
        {
          "id": "4",
          "name": "le Français"
        },
        {
          "id": "5",
          "name": "le générale"
        }
      ],
      "name": "Jaques Chirac",
      "shortName": "Chirac",
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": "2",
        "name": "Franzosen"
      }
    }

  ],
  "overlords": [
    {
      "id": "2",
      "name": "Angela Merkel",
      "shortName": "Merkel",
      "rank": 1,
      "role": {
        "id": null,
        "name": null
      },
      "dynasty": {
        "id": "1",
        "name": "Deutsche"
      },
      "titles": [
        {
          "id": "1",
          "name": "Prof."
        },
        {
          "id": "2",
          "name": "Dr."
        }, {
          "id": "5",
          "name": "Königin"
        }
      ],
      "honorifics": [{
        "id": "6",
        "name": "von Deutschland"
      }, {
        "id": "8",
        "name": "der Große"
      }
      ]
    },
    {
      "id": "6",
      "rank": 2,
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
      "titles": [{
        "id": "2",
        "name": "Dr."
      }],
      "honorifics": [{
        "id": "4",
        "name": "le Français"
      }]
    }
  ],
  "otherPersons": [
    {
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
      }
    }, {
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
      }
    }

  ],
  "caliph": {
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
    }
  },
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
  "coinMarks": [
    {
      "id": "4",
      "name": "π"
    }, {
      "id": "5",
      "name": "Ẳ"
    }
  ],
  "literature": "<div>vorhanden</div>",
  "pieces": [
    "https://de.wikipedia.org/wiki/Pompeji"
  ],
  "specials": "<div>Eis</div>",
  "excludeFromTypeCatalogue": false,
  "excludeFromMapApp": false,
  "internalNotes": "Fäschung!",
  "yearUncertain": false,
  "mintUncertain": false
}