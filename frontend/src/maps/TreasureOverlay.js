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
                    mintRegion {
                        id
                        name
                        uncertain
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
            console.error(e)
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
                if (item.mintRegion == null) continue

                if (!items[item.mintRegion.id]) {
                    items[item.mintRegion.id] = item
                    items[item.mintRegion.id].mintCount = 0
                    items[item.mintRegion.id].items = []
                }

                items[item.mintRegion.id].mintCount += item.count
                items[item.mintRegion.id].items.push(item)
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

            const style = {
                color,
                weight: 4
            }


            let treasureGeometries = []
            let treasureGeometriesShadows = []
            let itemGeometries = []
            let mintGeometriesShadows = []
            let lineGeometries = []
            let lineGeometriesShadows = []

            if (treasure.location) {

                let geometry
                let properties = {}
                if (treasure.location.type.toLowerCase() === "feature") {
                    geometry = treasure.location.geometry
                    properties = treasure.location.properties
                } else {
                    geometry = treasure.location
                }

                const feature = {
                    type: "Feature", geometry, properties: Object.assign({
                        treasure: treasure.id,
                        style: Object.assign({}, style, {
                            fill: true,
                            fillColor: color,
                            fillOpacity: .25,
                        })
                    }, properties)
                }


                treasureGeometries.push(feature)

                // treasureGeometriesShadows.push({
                //     type: "Feature", geometry: treasure.location, properties: {
                //         treasure: treasure.id,
                //         style: {
                //             color: shadowColor,
                //             opacity: shadowOpacity,
                //             weight: 8
                //         }
                //     }
                // })

                const maxWidth = 20
                const minWidth = 1

                if (treasure.items) {
                    let findLocation = treasure.location
                    const totalCount = treasure.items.reduce((acc, item) => acc + item.mintCount, 0)

                    treasure.items.forEach((item, idx) => {

                        if (item?.mintRegion?.location) {
                            let geometry
                            let location = item.mintRegion.location
                            if (location.type.toLowerCase() != "feature") {
                                geometry = location
                                location = {
                                    type: "Feature",
                                    geometry: location,
                                    properties: {
                                        style
                                    }
                                }
                            } else {
                                geometry = location.geometry
                                location.properties.style = style
                            }
                            itemGeometries.push(location)
                            

                            lineGeometries.push({
                                type: "Feature",
                                geometry: {
                                    type: "LineString",
                                    coordinates: [
                                        feature.geometry.coordinates,
                                        geometry.coordinates
                                    ]
                                },
                                properties: {
                                    style: Object.assign({}, style, {
                                        fill: false,
                                    })
                                }
                            })
                        }
                    })
                }
            }




            geoJSON.push([
                // Shadow layers
                // ...lineGeometriesShadows,
                // ...treasureGeometriesShadows,
                // ...mintGeometriesShadows,
                // Normal layers
                ...lineGeometries,
                ...treasureGeometries,
                ...itemGeometries,
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