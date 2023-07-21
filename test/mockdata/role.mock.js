
const CALIPH = {
    id: "1",
    name: "caliph"
}

const CUTTER = {
    id: "2",
    name: "cutter"
}

const DAULA = {
    id: "3",
    name: "Dāula"
}

const ROLE_GQL_BODY = `{ id,name }`
const ROLE_ADD_DATA = {
    name: "hĕir",
    id: "4"
}
const ROLE_ADD_INPUT = `name: "${ROLE_ADD_DATA.name}"`

const DAULA_UPDATE_DATA = {
    name: "Rukn",
    id: "3"
}


module.exports = {
    CALIPH,
    DAULA_UPDATE_DATA,
    CUTTER,
    DAULA,
    ROLE_ADD_DATA,
    ROLE_ADD_INPUT,
    ROLE_GQL_BODY,
}