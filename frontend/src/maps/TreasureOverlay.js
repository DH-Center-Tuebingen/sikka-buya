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

    transform(treasures) {
        return treasures
    }

    toMapObject(treasures) {

        let geoJSON = []
        treasures.forEach(treasure => {

            if (treasure.location) {
                geoJSON.push(treasure.location)
            }

            const maxWidth = 20
            const minWidth = 1

            if (treasure.items) {
                let findLocation = treasure.location

                const totalCount = treasure.items.reduce((acc, item) => acc + item.count, 0)

                treasure.items.forEach(item => {
                    if (item?.mint?.location) {
                        let loc = item.mint.location
                        geoJSON.push({
                            type: "Feature", geometry: loc, properties: {
                                isMint: true,
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

                            for (let i = 1; i < treasure.location.coordinates[0].length - 2; i++) {
                                let a = treasure.location.coordinates[0][i]
                                let b = treasure.location.coordinates[0][i + 1]

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

                                let d = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2)
                                if (d < dist) {
                                    dist = d
                                    start = [x, y]
                                }
                            }

                            if (start != null) {
                                let lineString = {
                                    type: "Feature",
                                    properties: {
                                        weight: Math.max(minWidth, Math.min(maxWidth, item.count / totalCount * maxWidth))
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
        })

        return {
            geoJSON
        }
    }

    createMarker(treasure) {
        return L.circleMarker(treasure, { radius: 5, fill: true, fillOpacity: 1 })
    }


    get geoJSONOptions() {
        return {
            style: function (feature) {
                const weight = feature.properties.weight || 1
                if (feature.geometry.type === "LineString") {
                    return { color: "blue", weight, linecap: "butt" }
                } else {
                    return { color: "blue", fill: feature.properties.isMint }
                }
            }
        }
    }
}