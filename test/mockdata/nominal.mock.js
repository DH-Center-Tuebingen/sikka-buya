const MARK = {
    "id": "2",
    "name": "1 Mark"
}
const TALER = {
    "id": "3",
    "name": "1 Taler"
}

const ZLOTY = {
    "id": "4",
    "name": "1 Złoty"
}

const ADIE = {
    "id": "1",
    "name": "₳die"
}

const NOMINAL_START_DATA = [
    MARK,
    TALER,
    ZLOTY,
    ADIE,
]


const NOMINAL_GQL_BODY = `{id name}`

module.exports = {
    NOMINAL_START_DATA,
    NOMINAL_GQL_BODY,
    MARK,
    TALER,
    ZLOTY,
    ADIE
}