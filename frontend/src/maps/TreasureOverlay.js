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
        console.log(treasures)
        let geoJSON = []
        treasures.forEach(treasure => {

            if (treasure.location) {
                geoJSON.push(treasure.location)
            }

            if (treasure.items) {
                let findLocation = treasure.location

                treasure.items.forEach(item => {
                    if (item?.mint?.location) {
                        let loc = item.mint.location
                        geoJSON.push(loc)

                        if (findLocation) {
                            let dist = Infinity
                            let start = null
                            findLocation.coordinates[0].forEach((coordinate, index) => {
                                console.log(coordinate, loc.coordinates)

                                let _dist = Math.sqrt(Math.pow(coordinate[0] - loc.coordinates[0], 2) + Math.pow(coordinate[1] - loc.coordinates[1], 2))
                                console.log(index, _dist)

                                if (_dist < dist) {
                                    dist = _dist
                                    start = coordinate
                                }
                            })
                            console.log(start)

                            if (start != null) {
                                console.log("LIENSTRING", [start, loc.coordinates])
                                let lineString = {
                                    type: "LineString",
                                    coordinates: [start, loc.coordinates]
                                }
                                geoJSON.push(lineString)
                            }
                        }
                    }
                })
            }
        })

        console.log(geoJSON)

        return {
            geoJSON
        }
    }

    createMarker(treasure) {
        return L.circleMarker(treasure, { radius: 5, fill: true, fillOpacity: 1 })
    }


    get geoJSONOptions() {
        return {
            style: {
                fillOpacity: 0
            }
        }
    }
}