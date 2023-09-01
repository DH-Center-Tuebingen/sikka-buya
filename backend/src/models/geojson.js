const { GraphQLError, GraphQLScalarType, Kind } = require('graphql')

class GeoJSON {
    //All implemented GeoJSON types: https://www.rfc-editor.org/rfc/rfc7946 
    static types = ['point', 'polygon']
    static fields = ['type', 'coordinates']
    static optionalFields = ['properties']


    static isEmpty(obj) {
        if (!obj || !obj.type) return true
        switch (obj.type.toLowerCase()) {
            case "point": GeoJsonPointGeoemtry.lengthOf(obj);
            case "polygon": GeoJsonPolygonGeometry.lengthOf(obj);
            default:
                console.error(`GeoJSON type "${obj.type}" is not implemented.`)
        }
    }

    static get scalarType() {
        return new GraphQLScalarType({
            name: "GeoJSON",
            description: "A geometryobject projected on a map represented in JSON format. Containing two properties:\n * 'type': the name of the provided geometry\n* 'coordinates': a list of coordinates defining the geometry",
            serialize(value) {
                if (typeof value === "string") value = JSON.parse(value)
                return value
            },
            parseValue(value) {
                if (!value.type) {
                    throw new GraphQLError(`GeoJSON requires a type!`)
                }

                let type = value.type.toLowerCase()

                if (GeoJSON.types.indexOf(type) === -1) {
                    throw new GraphQLError(`GeoJSON type "${type}" is either not valid or not implemented!`)
                } else {
                    switch (type) {
                        case GeoJsonPointGeoemtry.type:
                        case GeoJsonPolygonGeometry.type:
                            return value
                        default:
                            throw new GraphQLError(`GeoJSON type was not correctly implemented: ${type}`)
                    }
                }
            },
            parseLiteral(ast) {
                let parsedLiteral = null

                function recurseArrayValue(astNode, debug = false) {
                    switch (astNode.kind) {
                        case Kind.LIST:
                            let arr = []
                            astNode.values.forEach(child => {
                                arr.push(recurseArrayValue(child))
                            })
                            return arr
                        case Kind.FLOAT: return parseFloat(astNode.value)
                        case Kind.INT: return parseInt(astNode.value)
                        default:
                            return astNode.value
                    }


                }

                if (ast.kind === Kind.OBJECT) {
                    let fields = ast.fields
                    parsedLiteral = {}

                    const requiredFields = GeoJSON.fields.slice()

                    fields.forEach(field => {
                        const name = field.name.value

                        if (requiredFields.indexOf(name) !== -1) {
                            requiredFields.splice(requiredFields.indexOf(name), 1)
                        } else {
                            throw new Error(`Invalid key in GeoJSON: ${name}`)
                        }

                        let value;
                        if (name === "coordinates") {
                            let coordinatesValueNode = field.value
                            if (coordinatesValueNode.kind !== Kind.LIST) {
                                throw new Error(`Coordinates needs to be an array, got ${coordinatesValueNode.kind}`)
                            }
                            value = recurseArrayValue(coordinatesValueNode, name === "coordinates")
                        } else { // if field is "type"
                            let typeValueNode = field.value
                            if (typeValueNode.kind != Kind.STRING) throw new Error(`Expected type value to be 'string', got: ${typeValueNode.kind}`)
                            let type = typeValueNode.value.toLowerCase()
                            if (GeoJSON.types.indexOf(type) === -1) throw new Error(`Invalid or not implemented type: ${type}`)
                            value = type
                        }

                        parsedLiteral[name] = value
                    })

                    if (requiredFields.length > 0) {
                        throw new Error(`Missing required fields: ${requiredFields.join(", ")}`)
                    }

                }

                GeoJSON.validateParsedLiteral(parsedLiteral)
                return parsedLiteral
            }


        })
    }


    static validateParsedLiteral(parsedLiteral) {
        let err = `The coordinates field of a GeoJSON object of type '${parsedLiteral.type}' needs to be`
        switch (parsedLiteral.type) {
            case "point":
                if (!(Array.isArray(parsedLiteral.coordinates) && parsedLiteral.coordinates.length === 2 && parsedLiteral.coordinates.every(value => !isNaN(value))))
                    throw new Error(`${err} an array of exactly length 2 with numbers as values.`)
                break
            case "polygon":
                if (!(Array.isArray(parsedLiteral.coordinates) && parsedLiteral.coordinates.length > 0 && parsedLiteral.coordinates.every(arr => {
                    return Array.isArray(arr) && arr.length > 3 && arr[0].every((value, index) => value === arr[arr.length - 1][index])
                })))
                    throw new Error(`${err} an array of arrays with at least 1 element. All arrays need to have four or more items, where the first and last are the same coordinate.`)
                break
            default:
                throw new Error(`Coordinates validation for type "${parsedLiteral.type}" is not implemented!`)
        }
    }
}


class GeoJsonGeometry {
    static get type() {
        throw new Error("Abstract getter not implemented: type.")
    }

    static lengthOf(obj) {
        throw new Error("Abstract method not implemented: lengthOf.")
    }

    static is(obj) {
        if (obj?.type && obj.type.toLowerCase() === this.type) {
            return true
        }
        return false
    }
}


class GeoJsonPointGeoemtry extends GeoJsonGeometry {
    static get type() {
        return "point"
    }

    static lengthOf(obj) {
        return obj.coordinates.length === 2 ? 1 : 0
    }
}

class GeoJsonPolygonGeometry extends GeoJsonGeometry {
    static get type() {
        return "polygon"
    }

    static lengthOf(obj) {
        let length = 0
        obj.coordinates.forEach(arr => {
            length += arr?.length || 0
        })
        return length
    }
}


module.exports = {
    GeoJSON,
    GeoJsonPointGeoemtry,
    GeoJsonPolygonGeometry,
}