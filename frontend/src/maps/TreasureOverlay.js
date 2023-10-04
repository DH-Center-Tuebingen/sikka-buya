import L from "leaflet"
const Earth = L.CRS.Earth

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
        }`, {})

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
                weight: 3
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

                const findLocation = {
                    type: "Feature", geometry, properties: Object.assign({
                        treasure: treasure.id,
                        style: Object.assign({}, style, {
                            fill: false
                        })
                    }, properties)
                }

                const from = geometry.coordinates
                const fromRadius = properties.radius || 0

                treasureGeometries.push(findLocation)


                const maxWidth = 20
                const minWidth = 1

                if (treasure.items) {
                    const totalCount = treasure.items.reduce((acc, item) => acc + item.mintCount, 0)

                    const mintStyle = Object.assign({}, style, {
                        fill: true,
                        color: color,
                        fillColor: color,
                        fillOpacity: .25
                    })

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
                                        style: mintStyle,
                                    }
                                }
                            } else {
                                geometry = location.geometry
                                location.properties.style = mintStyle
                            }

                            const to = geometry.coordinates
                            const toRadius = location?.properties?.radius || 0

                            itemGeometries.push(location)

                            /**
                             * TODO: This is not quite correct, but the points recide on the circumference near the actual intersection
                             * so it should be good for the time beeing.
                             */
                            const intersectionLineFeature = this.getIntersectionLine(from, to, fromRadius, toRadius)
                            intersectionLineFeature.properties = Object.assign({}, { style })
                            lineGeometries.push(intersectionLineFeature)
                            // lineGeometries.push(this.getIntersectionLine(from, to, 0, toRadius))

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



    /**
     * This is the 'inverse' function for 
     * the L.CRS.Earth distance function.
     * 
     */
    getLatLngFromDistanceAndDirection(latlng1, distance, direction) {
        const R = 6371e3; // Earth's radius in meters
        const rad = Math.PI / 180;
        const lat1 = latlng1.lat * rad;
        const lng1 = latlng1.lng * rad;
        const bearing = Math.atan2(direction[1], direction[0]);

        const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
            Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearing));
        const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lat1),
            Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));

        const point = { lat: lat2 / rad, lng: lng2 / rad };

        return [point.lat, point.lng];
    }

    getIntersectionLine(from, to, fromRadius, toRadius) {
        const connectionVector = [to[0] - from[0], to[1] - from[1]]
        const connectionVectorLength = Math.sqrt(connectionVector[0] ** 2 + connectionVector[1] ** 2)
        const connectionVectorNormalized = [connectionVector[0] / connectionVectorLength, connectionVector[1] / connectionVectorLength]
        const start = this.getLatLngFromDistanceAndDirection({ lat: from[0], lng: from[1] }, fromRadius, connectionVectorNormalized)
        const end = this.getLatLngFromDistanceAndDirection({ lat: to[0], lng: to[1] }, toRadius, connectionVectorNormalized.map(x => -x))

        return {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    start,
                    end
                ]
            }
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
                    return Object.assign({ lineCap: "butt" }, feature?.properties?.style || {})
                } else {
                    return Object.assign({ fill: feature.properties.isMint }, feature?.properties?.style || {})
                }
            },
            onEachFeature: function (feature, layer) {
                if (feature?.properties?.text) {
                    layer.bindTooltip(feature.properties.text)
                }
            }
        }
    }

    bringTreasureToFront() {

    }
}