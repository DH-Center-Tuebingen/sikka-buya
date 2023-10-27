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

        let onSelectTreasure = () => { }
        if (callbacks.onSelectTreasure) {
            onSelectTreasure = callbacks.onSelectTreasure
            delete callbacks.onSelectTreasure
        }

        super(parent, settings, callbacks)

        this.onSelectTreasure = onSelectTreasure
        this.bringTreasureToFront = this.bringTreasureToFront.bind(this)
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
                description
                color
                items {
                    coinType {
                        projectId
                    }
                    count
                    epoch {
                        id
                        name
                    }
                    material {
                        id
                        name
                        color
                    }
                    mintRegion {
                        id
                        name
                        uncertain
                        location 
                    }
                    mintRegionUncertain
                    uncertainYear
                    year
                    weight
                    fragment
                    nominal {
                        id
                        name
                    }
                    reconstructed
                    mintAsOnCoin
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
        treasures.forEach(treasure => {

            const selectedTreasures = (Array.isArray(selections.treasures)) ? selections.treasures : []

            let totalCount = 0
            let items = {}
            for (let original of treasure.items) {
                let item = cloneDeep(original)
                if (item.mintRegion == null) continue

                if (!items[item.mintRegion.id]) {
                    items[item.mintRegion.id] = {}
                    items[item.mintRegion.id].mintRegion = item.mintRegion
                    items[item.mintRegion.id].count = 0
                    items[item.mintRegion.id].items = []
                }

                totalCount += item.count
                items[item.mintRegion.id].count += item.count
                items[item.mintRegion.id].items.push(item)
            }
            treasure.totalCount = totalCount

            const clone = cloneDeep(treasure)

            if (selectedTreasures.indexOf(treasure.id) !== -1) {
                clone.selected = true
            }

            clone.items = Object.values(items)
            transformedData.push(clone)
        })

        return transformedData
    }

    toMapObject(treasures, selections = { treasures: [] }) {
        let geoJSON = []
        const extendBorder = 20

        if (selections.treasures.length == 0) {
            const geom = this.showClickableTreasureArea(treasures)
            geoJSON.push(...geom)
        }

        const selectedTreasures = treasures.filter((treasure) => treasure.selected)
        for (let treasure of selectedTreasures.values()) {
            const color = treasure.color

            const style = {
                color,
                weight: 3
            }


            let treasureGeometries = []
            let itemGeometries = []
            let lineGeometries = []

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
                        }),
                        text: treasure.name,
                        extendBorder,
                    }, properties)
                }

                const from = geometry.coordinates
                const fromRadius = properties.radius || 0

                treasureGeometries.push(findLocation)

                if (treasure.items) {

                    const mintStyle = Object.assign({}, style, {
                        color: color,
                    })


                    treasure.items.forEach((item, idx) => {

                        if (item.mintRegion) {

                            const mintRegion = item.mintRegion
                            if (mintRegion.location) {
                                let geometry
                                let location = mintRegion.location
                                const properties =
                                {
                                    style: mintStyle,
                                    totalCount: treasure.totalCount,
                                    count: item.count,
                                    hoard: treasure.name,
                                    mint: mintRegion.name,
                                    extendBorder,
                                    text: `${mintRegion.name}: ${item.count} / ${treasure.totalCount} (${(100 * item.count / treasure.totalCount).toFixed(2)}%)`
                                }

                                if (location.type.toLowerCase() != "feature") {
                                    geometry = location
                                    location = {
                                        type: "Feature",
                                        geometry: location,
                                        properties
                                    }
                                } else {
                                    geometry = location.geometry
                                    location.properties = Object.assign({}, location.properties, properties)
                                }

                                const to = geometry.coordinates

                                itemGeometries.push(location)

                                /**
                                 * TODO: This is not quite correct, but the points recide on the circumference near the actual intersection
                                 * so it should be good for the time beeing.
                                 */
                                const intersectionLineFeature = this.getIntersectionLine(from, to, fromRadius, 0)
                                style.weight = 1
                                intersectionLineFeature.properties = Object.assign({}, properties, { style })
                                lineGeometries.push(intersectionLineFeature)
                                // lineGeometries.push(this.getIntersectionLine(from, to, 0, toRadius))

                            }
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


    showClickableTreasureArea(treasures) {
        let features = []
        console.log("showClickableTreasureArea", treasures)
        treasures.forEach(treasure => {
            if (treasure.location) {
                const treasureLocation = cloneDeep(treasure.location)
                if (!treasureLocation.properties) treasureLocation.properties = {}
                treasureLocation.properties.treasureId = treasure.id
                treasureLocation.properties.text = treasure.name
                treasureLocation.properties.extendBorder = 20
                treasureLocation.properties.onClick = "selectTreasure"
                treasureLocation.properties.force = true
                treasureLocation.properties.style = {
                    color: treasure.color || "#ffffff",
                    weight: 3,
                }

                features.push(treasureLocation)
            }
        })

        return features
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


    createRectMarker(latlng, feature) {
        let marker = null
        const { count = null, totalCount = null } = feature.properties
        const percent = 100 * (count / totalCount)


        const minSize = 5
        const stepsize = 10
        let size = minSize

        const stepSizeGroupsInPercent = [1, 5, 10, 25, 40, 60]

        let targetSizeGroup = stepSizeGroupsInPercent.shift()
        while (stepSizeGroupsInPercent.length > 0 && percent > stepSizeGroupsInPercent[0]) {
            targetSizeGroup = stepSizeGroupsInPercent.shift()
            size += stepsize
        }


        if (count != null && totalCount != null) {
            marker = L.shapeMarker(latlng, { shape: "square", radius: size, fill: false })

            //     marker.bindTooltip(`
            // ${feature.properties.mint} (${feature.properties.hoard})<br>
            // ${feature.properties.count} / ${feature.properties.totalCount} (${percent.toFixed(2)}%)
            // ` , { sticky: true })
        }

        return marker
    }


    extendBorder(marker, feature, func) {
        if (feature.properties.extendBorder) {
            marker.setStyle(feature.properties.style)
            marker = L.featureGroup([marker])
            const border = func()
            feature.properties.style = {}
            border.setStyle({ color: "red", opacity: 0, weight: feature.properties.extendBorder })
            border.addTo(marker)
            border.bringToFront()
        }
        return marker
    }


    createCircle(latlng, feature, { selections, markerOptions }) {

        let marker = null
        if (feature?.properties?.count > 0) {
            marker = this.createRectMarker(latlng, feature)
            marker = this.extendBorder(marker, feature, this.createRectMarker.bind(this, latlng, feature))
        } else {

            if (!markerOptions) markerOptions = {}
            marker = super.createCircle(latlng, feature, { selections, markerOptions })
            marker = this.extendBorder(marker, feature, super.createCircle.bind(this, latlng, feature, { selections, markerOptions }))

            // if (feature.properties.text) {
            //     marker.bindTooltip(feature.properties.text, { sticky: true })
            // }

            const treasureId = feature.properties.treasureId
            if (feature.properties.onClick && treasureId != null) {
                marker.on('click', () => this.select(treasureId))
                marker.on('remove', () => marker.off())
            }
        }

        return marker
    }

    select(treasureId) {
        this.onSelectTreasure(treasureId)
    }

    createMarker(latlng, feature) {
        // Use the area as value for the radius
        const marker = this.createRectMarker(latlng, feature)
        return this.extendBorder(marker, feature, this.createRectMarker.bind(this, latlng, feature))

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
                    layer.bindTooltip(feature.properties.text, { sticky: true })
                }
            }
        }
    }

    bringTreasureToFront() {

    }
}