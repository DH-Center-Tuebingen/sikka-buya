const ATLANT = {
    "id": "5",
    "name": "Atlant"
}

const BRIT = {
    "id": "3",
    "name": "Briten"
}
const GERMAN = {
    "id": "1",
    "name": "Deutsche"
}

const FRENCH = {
    "id": "2",
    "name": "Franzosen"
}
const AUSTRIAN = {
    "id": "4",
    "name": "Österreicher"
}

const DYNASTY_START_DATA = {
    "data": {
        "dynasty": [
            ATLANT,
            BRIT,
            GERMAN,
            FRENCH,
            AUSTRIAN,
        ]
    }
}

const DYNASTY_GQL_BODY = `{id,name}`

module.exports = {
    DYNASTY_START_DATA,
    DYNASTY_GQL_BODY,
    ATLANT,
    BRIT,
    GERMAN,
    FRENCH,
    AUSTRIAN
}