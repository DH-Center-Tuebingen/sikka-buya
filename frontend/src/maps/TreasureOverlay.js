import L from "leaflet"

import Query from '../database/query';
import Overlay from './Overlay';

import { cloneDeep } from 'lodash';


function bringToFront(e) {
    e.target.bringToFront()
}

export default class TreasureOverlay extends Overlay {

    constructor(parent, settings, callbacks = {}) {
        callbacks.onFeatureGroupAdded = function (group) {
            group.on('mouseover', bringToFront)
        }

        callbacks.onFeatureGroupRemoved = function (group) {
            group.off('mouseover', bringToFront)
        }

        super(parent, settings, callbacks)

        this.bringTreasureToFront = this.bringTreasureToFront.bind(this)
    }


    get colors() {
        return [
            "#ff0080",
            "#9d3cff",
            "#54c8b8",
            "#ffff00",
            "#ffb09d",
            "#802b40",
            "#00ffff",
            "#ffffff",
            "#00ff00",
        ]
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
                    fragment
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

    transform(treasures, selections = { treasures: [] }) {

        let transformedData = []
        let colorIndex = 0
        treasures.forEach(treasure => {

            const selectedTreasures = (Array.isArray(selections.treasures)) ? selections.treasures : []

            let items = {}
            for (let original of treasure.items) {
                let item = cloneDeep(original)
                if (item.mint == null) continue

                if (!items[item.mint.id]) {
                    items[item.mint.id] = item
                    items[item.mint.id].mintCount = 0
                    items[item.mint.id].items = []
                }

                items[item.mint.id].mintCount += item.count
                items[item.mint.id].items.push(item)
            }
            const clone = cloneDeep(treasure)

            if (selectedTreasures.length > 0 && selectedTreasures.indexOf(treasure.id) !== -1) {
                clone.color = this.colors[colorIndex % this.colors.length]
                clone.selected = true
                colorIndex++
            }
            clone.items = Object.values(items)
            transformedData.push(clone)
        })

        return transformedData
    }

    toMapObject(treasures, selections = { treasures: [] }) {
        const shadowColor = "#000"
        const shadowOpacity = 1

        let geoJSON = []


        for (let [index, treasure] of treasures.entries()) {
            if (!treasure.selected) continue
            const color = treasure.color


            let treasureGeometries = []
            let treasureGeometriesShadows = []
            let mintGeometries = []
            let mintGeometriesShadows = []
            let lineGeometries = []
            let lineGeometriesShadows = []

            if (treasure.location) {
                treasureGeometries.push({
                    type: "Feature", geometry: treasure.location, properties: {
                        treasure: treasure.id,
                        style: {
                            fill: true,
                            fillColor: color,
                            fillOpacity: .25,
                            color,
                            weight: 4
                        }
                    }
                })

                treasureGeometriesShadows.push({
                    type: "Feature", geometry: treasure.location, properties: {
                        treasure: treasure.id,
                        style: {
                            color: shadowColor,
                            opacity: shadowOpacity,
                            weight: 8
                        }
                    }
                })

            }

            const maxWidth = 20
            const minWidth = 1

            if (treasure.items) {
                let findLocation = treasure.location
                const totalCount = treasure.items.reduce((acc, item) => acc + item.mintCount, 0)

                treasure.items.forEach((item, idx) => {
                    const mint = item.mint
                    if (mint?.location) {
                        let loc = item.mint.location
                        const feature = {
                            type: "Feature", geometry: loc
                        }


                        mintGeometries.push(Object.assign({}, feature, {
                            properties: {
                                isMint: true,
                                count: item.mintCount,
                                text: `<b>${mint.name}</b><br>Anzahl: ${item.mintCount}`,
                                style: {
                                    color,
                                    fillColor: color,
                                    fillOpacity: 1,
                                    weight: 2,
                                }
                            }
                        }))

                        mintGeometriesShadows.push(Object.assign({}, feature, {
                            properties: {
                                isMint: true,
                                count: item.mintCount,
                                style: {
                                    color: shadowColor,
                                    opacity: shadowOpacity,
                                    fillOpacity: 0,
                                    weight: 6,
                                }
                            }
                        }))

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
                                        treasure: treasure.id,
                                        style: {
                                            weight: 2,
                                            opacity: 1,
                                            color,
                                        }

                                    },
                                    geometry: {
                                        type: "LineString",
                                        coordinates: [start, loc.coordinates],
                                    }
                                }
                                lineGeometries.push(lineString)
                                lineGeometriesShadows.push(Object.assign({}, lineString, {
                                    properties: {
                                        treasure: treasure.id,
                                        style: {
                                            weight: 6,
                                            opacity: shadowOpacity,
                                            color: shadowColor,
                                        }
                                    }
                                }))
                            }
                        }

                    }
                })

            }

            geoJSON.push([
                // Shadow layers
                ...lineGeometriesShadows,
                ...treasureGeometriesShadows,
                ...mintGeometriesShadows,
                // Normal layers
                ...lineGeometries,
                ...treasureGeometries,
                ...mintGeometries,
            ])
        }


        return {
            geoJSON
        }
    }

    createMarker(latlng, feature) {
        // Use the area as value for the radius
        const minRadius = 1
        let r = minRadius
        const multiplier = 4


        if (feature.properties.count)
            r = Math.sqrt(feature.properties.count / Math.PI) * multiplier

        const marker = L.circleMarker(latlng, { radius: Math.max(r, minRadius) })
        return marker
    }

    repaint() {
        if (this.layer) {
            this.layer.off('mouseover', this.bringTreasureToFront)
        }

        super.repaint(...arguments)

        if (this.layer) {
            this.layer.on('mouseover', this.bringTreasureToFront)
        }
    }

    get geoJSONOptions() {
        return {
            style: function (feature) {
                if (feature.geometry.type === "LineString") {
                    return Object.assign({ lineCap: "butt" }, feature.properties.style)
                } else {
                    return Object.assign({ fill: feature.properties.isMint }, feature.properties.style)
                }
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties.text) {
                    layer.bindTooltip(feature.properties.text)
                }
            }
        }
    }

    bringTreasureToFront() {

    }
}