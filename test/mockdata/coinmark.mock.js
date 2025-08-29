const A = {
    "id": "1",
    "name": "Ä"
}
const E = {
    "id": "3",
    "name": "ê"
}
const U = {
    "id": "2",
    "name": "Ü"
}
const PI = {
    "id": "4",
    "name": "π"
}
const EURO = {
    "id": "5",
    "name": "€"
}

const UPDATE_EURO = {
    "id": "5",
    "name": "EUR+"
}

const TALER = {
    "id": "6",
    "name": "TALER"
}

const NEW = {
    "id": "7",
    "name": "NEW"
}

const COINMARK_GQL_BODY = `{
    id,
    name
}`

module.exports = {
    A,
    E,
    U,
    PI,
    EURO,
    UPDATE_EURO,
    NEW,
    TALER,
    COINMARK_GQL_BODY,
}