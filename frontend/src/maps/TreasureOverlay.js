import L from "leaflet"

import Query from '../database/query';
import Overlay from './Overlay';

export default class TreasureOverlay extends Overlay {
    constructor(parent, settings, {
        onDataTransformed,
        onGeoJSONTransformed
    }) {
        super(parent, settings, {
            onDataTransformed,
            onGeoJSONTransformed
        });
    }


    async fetch() {
        let treasures = null
        try {
            const result = await Query.raw(`{
            treasure {
                id
                name
                location 
                timespan {from to}
                items {
                    coinType {
                        projectId
                    }
                    count
                    dynasty {
                        id
                        name
                    }
                    material {
                        id
                        name
                    }
                    mint {
                        id
                        name
                        location 
                    }
                    uncertainMint
                    uncertainYear
                    year
                    weight
                    nominal {
                        id
                        name
                    }
                }
            }
        }`, {}, true)

            treasures = result.data.data.treasure
        } catch (e) {
            console.log(e)
        }
        return treasures
    }

    transform(treasures, {
        selections = []
    } = {}) {

        treasures.forEach(treasure => {

            let items = {}
            for (let item of treasure.items) {
                if (item.mint == null) continue

                if (!items[item.mint.id]) {
                    items[item.mint.id] = {
                        mint: item.mint,
                        count: 0
                    }
                }

                items[item.mint.id].count += item.count
            }
            treasure.items = Object.values(items)
        })

        return treasures


    }

    toMapObject(treasures, selections = { treasures: [] }) {

        let colorMap = [
            "red",
            "yellow",
            "orange",
            "purple",
            "pink",
            "black",
            "white",
            "brown",
            "blue",
            "gray",
            "cyan",
            "magenta",
            "lime",
            "maroon",
            "navy",
            "olive",
            "teal",
            "silver",
            "gold",
            "indigo",
            "violet",
            "turquoise",
            "tan",

        ]

        let geoJSON = []

        for (let [index, treasure] of treasures.entries()) {
            console.log(selections.treasures, treasure.id)
            if (selections.treasures.indexOf(treasure.id) === -1) continue

            let color = colorMap[index % colorMap.length]
            if (treasure.location) {
                geoJSON.push({
                    type: "Feature", geometry: treasure.location, properties: {
                        color,
                    }
                })
            }

            const maxWidth = 20
            const minWidth = 1

            if (treasure.items) {
                let findLocation = treasure.location
                const totalCount = treasure.items.reduce((acc, item) => acc + item.count, 0)

                treasure.items.forEach((item, idx) => {

                    if (item?.mint?.location) {
                        let loc = item.mint.location
                        geoJSON.push({
                            type: "Feature", geometry: loc, properties: {
                                isMint: true,
                                color,
                                text: `Anzahl: ${item.count}`
                            }
                        })

                        let center = [0, 0]

                        for (let i = 1; i < treasure.location.coordinates[0].length; i++) {
                            center[0] += treasure.location.coordinates[0][i][0]
                            center[1] += treasure.location.coordinates[0][i][1]
                        }

                        center[0] /= treasure.location.coordinates[0].length - 1
                        center[1] /= treasure.location.coordinates[0].length - 1

                        if (findLocation) {
                            let dist = Infinity
                            let start = null
                            let startIdx = -1
                            let endIdx = -1

                            const length = treasure.location.coordinates[0].length
                            for (let i = 0; i < length; i++) {
                                let a = treasure.location.coordinates[0][i]
                                let b = treasure.location.coordinates[0][(i + 1) % length]

                                //Line intersection between center to mint and treasure location
                                let x1 = center[0]
                                let y1 = center[1]
                                let x2 = loc.coordinates[0]
                                let y2 = loc.coordinates[1]
                                let x3 = a[0]
                                let y3 = a[1]
                                let x4 = b[0]
                                let y4 = b[1]

                                let x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
                                let y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))


                                // determine if intersection is between the points a and b
                                let xMin = Math.min(x3, x4)
                                let xMax = Math.max(x3, x4)
                                let yMin = Math.min(y3, y4)
                                let yMax = Math.max(y3, y4)

                                if (xMin <= x && x <= xMax && yMin <= y && y <= yMax) {



                                    let d = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2)

                                    if (d < dist) {
                                        dist = d
                                        start = [x, y]
                                        startIdx = i
                                        endIdx = i + 1
                                    }
                                }
                            }

                            if (start != null) {
                                let lineString = {
                                    type: "Feature",
                                    properties: {
                                        weight: Math.max(minWidth, Math.min(maxWidth, item.count / totalCount * maxWidth)),
                                        color
                                    },
                                    geometry: {
                                        type: "LineString",
                                        coordinates: [start, loc.coordinates]
                                    }
                                }
                                geoJSON.push(lineString)
                            }
                        }

                    }
                })

            }
        }

        return {
            geoJSON
        }
    }

    createMarker(latlng, feature) {
        const marker = L.circleMarker(latlng, { radius: 5, fill: true, fillOpacity: 1 })
        if (feature.properties.text) {
            marker.bindTooltip(feature.properties.text)
        }
        return marker
    }


    get geoJSONOptions() {
        return {
            style: function (feature) {
                const color = feature.properties.color || "blue"
                const weight = feature.properties.weight || 1
                if (feature.geometry.type === "LineString") {
                    return { color, weight, lineCap: "butt" }
                } else {
                    return { color, fill: feature.properties.isMint }
                }
            }
        }
    }
}