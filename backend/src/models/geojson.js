const { GraphQLError, GraphQLScalarType, Kind } = require('graphql')

class GeoJSON {
    //All implemented GeoJSON types: https://www.rfc-editor.org/rfc/rfc7946 
    static types = ['point', 'polygon', 'feature']
    static fields = ['type', 'coordinates']


    static rebuild(location, properties) {
        if (properties?.isFeature) {
            delete properties.isFeature
            return {
                type: "Feature",
                geometry: location,
                properties
            }
        } else return location
    }

    static separate(obj) {
        let feature = {
            geometry: null,
            properties: null
        }

        if (!obj?.type) {
            return feature
        }

        switch (obj.type.toLowerCase()) {
            case GeoJsonPointGeoemtry.type:
            case GeoJsonPolygonGeometry.type:
                feature.geometry = obj
                break
            case GeoJsonFeature.type:
                let properties = Object.assign({}, obj.properties, { isFeature: true })
                feature.geometry = obj.geometry
                feature.properties = properties
                break
            default:
                throw new Error(`GeoJSON type "${obj.type}" is not implemented.`)
        }
        return feature
    }


    static isEmpty(obj) {
        if (!obj || !obj.type) return true
        switch (obj.type.toLowerCase()) {
            case "point": return GeoJsonPointGeoemtry.lengthOf(obj) === 0;
            case "polygon": return GeoJsonPolygonGeometry.lengthOf(obj) === 0;
            case "feature": return GeoJsonFeature.isEmpty(obj)
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
                        case GeoJsonFeature.type:
                        case GeoJsonPointGeoemtry.type:
                        case GeoJsonPolygonGeometry.type:
                            return value
                        default:
                            throw new GraphQLError(`GeoJSON type was not correctly implemented: ${type}`)
                    }
                }
            },
            parseLiteral(ast) {

                function parseAst(astNode, debug = false) {
                    switch (astNode.kind) {
                        case Kind.OBJECT:
                            let obj = {}
                            astNode.fields.forEach(field => {
                                obj[field.name.value] = parseAst(field.value)
                            })
                            return obj
                        case Kind.LIST:
                            let arr = []
                            astNode.values.forEach(child => {
                                arr.push(parseAst(child))
                            })
                            return arr
                        case Kind.FLOAT: return parseFloat(astNode.value)
                        case Kind.INT: return parseInt(astNode.value)
                        default:
                            return astNode.value
                    }
                }

                if (ast.kind !== Kind.OBJECT) throw new GraphQLError(`GeoJSON needs to be an object!`)
                let parsedLiteral = parseAst(ast)
                GeoJSON.validateObject(parsedLiteral)
                return parsedLiteral
            }
        })
    }

    static validateGeometry(parsedLiteral) {
        // GeoJSON can be null
        if (parsedLiteral == null) return true
        if (!parsedLiteral.type) throw new Error(`A GeoJSON geometry object needs a type!`)

        const type = parsedLiteral.type.toLowerCase()
        let prefix = `The coordinates field of a GeoJSON geometry object of type '${type}' needs to be`

        if (!parsedLiteral.coordinates) throw new Error(`A GeoJSON object needs coordinates!`)
        const coordinates = parsedLiteral.coordinates

        if (!Array.isArray(coordinates))
            throw new Error(`${prefix} an array!`)


        switch (type) {
            case "point":
                GeoJSON.pointValidator(coordinates, prefix)
                break
            case "polygon":
                if (coordinates.length < 1)
                    throw new Error(`${prefix} an array of at least 1.`)

                for (const [index, solidOrHoleArr] of coordinates.entries()) {
                    let prefix = `Invalid coordinates field of a GeoJSON geometry object of type '${type}' at subarray '${index}': `

                    if (!Array.isArray(solidOrHoleArr))
                        throw new Error(`${prefix} an array of arrays!`)

                    if (solidOrHoleArr.length < 4) throw new Error(`${prefix} an array of arrays with at least 4 items!`)

                    for (const pointArr of solidOrHoleArr) {
                        let _prefix = `${prefix} an array of arrays where every element is a point: `
                        GeoJSON.pointValidator(pointArr, _prefix)
                    }

                    const firstPoint = solidOrHoleArr[0]
                    const lastPoint = solidOrHoleArr[solidOrHoleArr.length - 1]


                    if (!(firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]))
                        throw new Error(`${prefix} an array of arrays where the first and last point are the same!`)

                    //Note: We dont follow the right-hand rule, as the user might draw in the opposite direction
                }
                break
            default:
                throw new Error(`Coordinates validation for type "${parsedLiteral.type}" is not implemented!`)
        }
    }

    static pointValidator(coordinates, prefix) {
        if (!(coordinates.length === 2 && coordinates.every(value => !isNaN(value))))
            throw new Error(`${prefix} an array of exactly length 2 with numbers as values.`)
    }

    static validateObject(parsedLiteral) {

        if (!parsedLiteral.type) throw new Error(`A GeoJSON object needs a type!`)
        const type = parsedLiteral.type.toLowerCase()
        let geometry = parsedLiteral
        if (type === "feature") {
            if (!parsedLiteral.geometry) throw new Error(`A GeoJSON feature needs a 'geometry' object!`)
            geometry = parsedLiteral.geometry
        }

        GeoJSON.validateGeometry(geometry)
    }
}

class GeoJSONBase {
    static get type() {
        throw new Error("Abstract getter not implemented: type.")
    }

}

class GeoJsonFeature extends GeoJSONBase {
    static get type() {
        return "feature"
    }

    static isEmpty(obj) {
        if (!obj || !obj.type) return true
        switch (obj.type.toLowerCase()) {
            case "feature":
                return GeoJSON.isEmpty(obj.geometry)
            default:
                console.error(`GeoJSON type "${obj.type}" is not implemented.`)
        }
    }

    static validateObject(parsedLiteral) {
        if (!parsedLiteral.geometry) {
            throw new Error(`A GeoJSON feature needs a geometry!`)
        }
        GeoJSON.validateObject(parsedLiteral.geometry)
    }
}


class GeoJsonGeometry extends GeoJSONBase {

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