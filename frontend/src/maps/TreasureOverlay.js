import L from "@/leaflet.js"
import Query from '../database/query';
import Overlay from './Overlay';
import { MintLocationMarker } from '../models/mintlocation'

import { cloneDeep } from 'lodash';
import Mint from '../models/map/mint';


// ON REFACTOR: I think trying to push all states in a single overlay is a bad idea.
// It would be better to have a single overlay for each state.

export default class TreasureOverlay extends Overlay {

    constructor(parent, settings, options = {}) {

        if (!options?.additionalData?.mints) throw new Error("Missing mints in additionalData")


        //TODO: REIMPLEMENT IF NEEDED
        // function bringToFront(e) {
        //     e.target.bringToFront()
        //     if (callbacks.onBringToFront) callbacks.onBringToFront(e)
        // }

        // callbacks.onFeatureGroupAdded = function (group) {
        //     group.on('mouseover', bringToFront)
        // }

        // callbacks.onFeatureGroupRemoved = function (group) {
        //     group.off('mouseover', bringToFront)
        // }

        let onSelectTreasure = () => { }
        if (options.onSelectTreasure) {
            onSelectTreasure = options.onSelectTreasure
            delete options.onSelectTreasure
        }

        super(parent, settings, options)

        this.onSelectTreasure = onSelectTreasure

        this.mintGeometryMap = {}
    }

    async fetch({ selections = {} } = {}) {
        let data = {
            treasures: [],
            treasuresByMint: []
        }
        const { mints = [] } = selections
        try {
            if (mints.length > 0)
                data.treasuresByMint = await this.fetchTreasuresByMints(mints)

            data.treasures = await this.fetchTreasures()

        } catch (e) {
            console.error(e)
        }
        return data
    }

    async fetchTreasuresByMints(mints) {
        const result = await Query.raw(`
        query GetTreasuresByMintSelection($mintIds: [ID]){
            getTreasuresByMintSelection(mintIds: $mintIds){
                totalCount
                mint {
                    id 
                    name 
                    location 
                }
                treasures {
                    count
                    treasure {
                        id 
                        name 
                        location 
                        color
                    }
                }
            }}` , { mintIds: mints })

        return result.data.data.getTreasuresByMintSelection
    }

    async fetchTreasures() {
        const result = await Query.raw(`{
            treasure {
                id
                name
                location 
                timespan {from to}
                description
                color
                items {
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

        return result.data.data.treasure
    }


    transform(data, selections = { treasures: [] }) {

        const treasures = data.treasures
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
        data.treasures = transformedData
        return data
    }

    toFeature(geoJson, properties = {}) {
        if (geoJson.type.toLowerCase() !== "feature") {
            geoJson = {
                type: "Feature",
                geometry: geoJson,
                properties
            }
        }

        Object.assign(geoJson.properties, properties)

        return geoJson
    }

    toMapObject(data, selections = {}) {
        let geoJSON = []
        let connections = []

        const extendBorder = 20

        const {
            treasures: selectedTreasureIds = [],
            mints: selectedMintIds = []
        } = selections

        if (selectedTreasureIds.length == 0 && selectedMintIds.length == 0) {
            const geom = this.showClickableTreasureArea(data.treasures, { extendBorder })
            geoJSON.push(...geom)
        } else if (selectedMintIds.length > 0) {
            ; ({ geoJSON, connections } = this.createMintSelectionMapObjects(data.treasuresByMint, selectedMintIds, { extendBorder }))
        } else if (selectedTreasureIds.length > 0) {
            ; ({ geoJSON, connections } = this.createTreasureMapObjects(data.treasures, selectedTreasureIds, { extendBorder }))
        }

        return {
            geoJSON,
            connections
        }
    }

    createGeometry({ geoJSON = null, connections = null } = {}, { selections, markerOptions } = {}) {


        const mintLocationFeatureGroup = this.updateMintLocationMarker({ selections })
        mintLocationFeatureGroup.addTo(this.layer)
        mintLocationFeatureGroup.bringToBack()

        const treasureMap = {}
        const mintMap = {}

        // For some obscure reason we cannot manage the connectors in a feature group
        // with the treasure geometries, as it then (and only then) throws an error
        // possibly cause a square marker is not properly projected in the time the
        // connector is added to that feature group.
        //
        // So we just reorder the whole group after adding the connectors.
        let geometryGroups = {

        }

        let order = 0

        const {
            treasures: selectedTreasureIds = [],
            mints: selectedMintIds = []
        } = selections

        if (geoJSON) {
            const that = this
            geoJSON.forEach(feature => {

                let treasureId = null

                let geometry = new L.geoJSON(feature, Object.assign({}, {
                    pointToLayer: function (feature, latlng) {

                        let geometry
                        const radius = parseInt(feature?.properties?.radius)
                        if (!isNaN(radius)) {
                            geometry = that.createCircle.call(that, latlng, feature, { selections, markerOptions })
                        } else {
                            geometry = that.createMarker.call(that, latlng, feature, { selections, markerOptions })
                        }

                        if (feature?.properties?.treasure) {
                            let id = feature.properties.treasure.id ? feature.properties.treasure.id : feature.properties.treasure
                            treasureMap[id] = geometry
                            treasureId = id
                        } else if (feature?.properties?.mintId) {

                            const hoard = feature.properties.hoardId

                            if (!mintMap[hoard]) mintMap[hoard] = {}

                            mintMap[hoard][feature.properties.mintId] = geometry
                        }

                        return geometry
                    },
                    coordsToLatLng: function (coords) {
                        return new L.LatLng(coords[0], coords[1], coords[2]);
                    },
                }, this.geoJSONOptions));


                if (treasureId) {
                    geometryGroups[treasureId] = { order: order++, geometries: [geometry] }
                }

                this._addFeatureGroup(geometry)
            })
        }

        if (connections) {

            const extendBorder = 10

            connections.forEach(connection => {

                if (selectedTreasureIds.length > 0) {
                    let treasure = treasureMap[connection.treasure]
                    if (treasure.original) treasure = treasure.original

                    if (treasure) {
                        let mint = mintMap[connection.treasure][connection.mint]
                        if (mint.original) mint = mint.original

                        if (mint) {

                            let line = L.connector([treasure, mint], {
                                color: treasure.options.color,
                                weight: 2,
                            })

                            line = this.extendBorder(
                                line,
                                { properties: { extendBorder } },
                                () => L.connector([treasure, mint])
                            )

                            geometryGroups[connection.treasure].geometries.push(line)
                            line.addTo(this.layer)


                            line.bindTooltip(connection.text, { sticky: true })
                        }
                    }
                } else if (selectedMintIds.length > 0) {
                    let treasure = treasureMap[connection.treasure]
                    if (treasure.original) treasure = treasure.original

                    let mint = this.mintGeometryMap[connection.mint]
                    if (mint.original) mint = mint.original

                    if (treasure && mint) {
                        let line = L.connector([treasure, mint], {
                            color: treasure.options.color,
                            weight: 2,
                        })

                        line = this.extendBorder(
                            line,
                            { properties: { extendBorder } },
                            () => L.connector([treasure, mint])
                        )

                        line.addTo(this.layer)

                    }
                }
            })
        }


        const _bringToFront = (geometry) => {
            geometry.bringToFront()
            geometry.addTo(targetLayer)
        }

        const targetLayer = this.layer
        for (let group of Object.values(geometryGroups)) {
            group.geometries.forEach(geometry => {

                geometry.off("mouseover", _bringToFront)
                geometry.on("mouseover", () => {
                    group.geometries.forEach(geometry => {
                        _bringToFront(geometry)
                    })
                })
                geometry.bringToFront()
                geometry.addTo(targetLayer)
            })
        }
    }


    showClickableTreasureArea(treasures, { extendBorder = 20 } = {}) {
        let features = []
        treasures.forEach(treasure => {
            if (treasure.location) {
                const treasureLocation = cloneDeep(treasure.location)
                if (!treasureLocation.properties) treasureLocation.properties = {}
                treasureLocation.properties.treasureId = treasure.id
                treasureLocation.properties.text = treasure.name
                treasureLocation.properties.extendBorder = extendBorder
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

    createMintSelectionMapObjects(data, selectedMintIds, { extendBorder = 20 } = {}) {
        let geoJSON = []
        let connections = []
        data.forEach(treasuresByMint => {
            if (treasuresByMint?.mint?.location) {
                let mintLocation = treasuresByMint.mint.location

                mintLocation = this.toFeature(mintLocation, {
                    isMint: false,
                    isFocus: true,
                })


                if (treasuresByMint && Array.isArray(treasuresByMint.treasures)) {
                    treasuresByMint.treasures.forEach(treasureCount => {
                        let location = treasureCount.treasure.location
                        const treasure = treasureCount.treasure

                        if (location) {

                            const color = treasure.color

                            const text = `${treasure.name}: ${treasureCount.count} / ${treasuresByMint.totalCount} (${(100 * treasureCount.count / treasuresByMint.totalCount).toFixed(2)}%)`

                            let treasureArea = this.toFeature(location, {
                                totalCount: treasuresByMint.totalCount,
                                // count: treasureCount.count,
                                extendBorder,
                                isMint: true,
                                text,
                                style: {
                                    color,
                                    weight: 3,
                                    fill: false,
                                },
                                treasure: treasure
                            })

                            connections.push({
                                treasure: treasure.id,
                                mint: treasuresByMint.mint.id,
                            })

                            geoJSON.push(treasureArea)
                        } else {
                            console.warn("No location for treasure", treasureCount.treasure)
                        }
                    })
                }
            }
        })

        return { geoJSON, connections }
    }


    createTreasureMapObjects(treasures, selectedTreasureIds, { extendBorder = 20 } = {}) {
        const geoJSON = []
        const connections = []

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

                                const text = `${mintRegion.name}: ${item.count} / ${treasure.totalCount} (${(100 * item.count / treasure.totalCount).toFixed(2)}%)`

                                connections.push({
                                    treasure: treasure.id,
                                    mint: mintRegion.id,
                                    text
                                })

                                let geometry
                                let location = mintRegion.location
                                const properties =
                                {
                                    style: mintStyle,
                                    totalCount: treasure.totalCount,
                                    count: item.count,
                                    hoardId: treasure.id,
                                    hoard: treasure.name,
                                    mintId: mintRegion.id,
                                    mint: mintRegion.name,
                                    extendBorder,
                                    text,
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
                // ...lineGeometries
                ...treasureGeometries,
                ...itemGeometries,
            ])
        }

        return { geoJSON, connections }
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

    updateMintLocationMarker({ selections = [] } = {}) {
        this.mintGeometryMap = {}
        const mintSelection = selections.mints || []

        let allMintGroup = L.featureGroup()

        const overlayContext = this
        this.additionalData.mints.forEach(mint => {
            const geoJSON = new L.geoJSON(mint.location, {
                pointToLayer(point) {
                    let position = point.geometry ? point.geometry : point
                    const latlng = { lat: position.coordinates[0], lng: position.coordinates[1] }

                    let marker
                    const active = mintSelection.includes(mint.id)
                    if (point?.properties?.radius) {
                        const group = L.featureGroup()

                        const mintRegionMarker = new MintLocationMarker(mint)
                        let mlm = mintRegionMarker.create(latlng, { size: (active) ? 7 : 4, active })
                        mlm.bindPopup(Mint.popupMintHeader(mint, ["underlined-header"]))


                        let activeStyle = {}
                        if (active) {
                            activeStyle = {
                                color: "white",
                                fillColor: "#000"
                            }
                        }

                        const circle = L.circle(latlng, point.properties.radius, Object.assign({
                            weight: 1,
                            fillOpacity: 0.75,

                        }, MintLocationMarker.normalStyle, activeStyle))



                        circle.addTo(group)
                        mlm.addTo(group)

                        overlayContext.mintGeometryMap[mint.id] = circle
                        // TODO: REIMPLEMENT
                        // /**
                        //  * Hides the markers at a specific zoom level
                        //  */
                        // vueContext.map.on("zoomend", () => {
                        //     const zoom = vueContext.map.getZoom()
                        //     if (zoom > vueContext.$mconfig.getInteger("map.hoards.marker_zoom_threshold", 0)) {
                        //         group.removeLayer(mlm)
                        //     } else {
                        //         group.addLayer(mlm)
                        //     }
                        // })

                        group.addLayer(mlm)
                        group.getElement = () => {
                            return mlm.getElement()
                        }
                        marker = group
                    } else {
                        const mintRegionMarker = new MintLocationMarker(mint)
                        marker = mintRegionMarker.create(latlng, { size: (active) ? 7 : 4, active })
                        marker.bindPopup(Mint.popupMintHeader(mint, ["underlined-header"]))
                        overlayContext.mintGeometryMap[mint.id] = mintRegionMarker.circleMarker
                    }

                    return marker
                }
            })

            // TODO: REIMPLEMENT
            // geoJSON.bindTooltip(mint.name, { sticky: true })
            // geoJSON.on("click", () => {
            //     if (vueContext.selectedTreasureIds.length === 0) {
            //         if (vueContext.selectedMintIds.includes(mint.id)) {
            //             vueContext.selectedMintIds = vueContext.selectedMintIds.filter(id => id !== mint.id)
            //         } else {
            //             vueContext.selectedMintIds = [mint.id]
            //         }

            //         vueContext.update()
            //     }
            // })
            geoJSON.addTo(allMintGroup)
        })

        return allMintGroup
    }


    createRectMarker(latlng, feature) {
        let marker = null

        const { count = null, totalCount = null } = feature.properties
        const percent = 100 * (count / totalCount)

        const minSize = this.settings.boxMinSize
        const stepsize = this.settings.boxStepSize
        let size = minSize
        const stepSizeGroupsInPercent = this.settings.stepSizeGroupsInPercent.slice()

        let targetSizeGroup = stepSizeGroupsInPercent.shift()
        while (stepSizeGroupsInPercent.length > 0 && percent > stepSizeGroupsInPercent[0]) {
            targetSizeGroup = stepSizeGroupsInPercent.shift()
            size += stepsize
        }


        if (count != null && totalCount != null) {
            marker = new L.ShapeMarker(latlng, { shape: "square", radius: size, fill: false })

            //     marker.bindTooltip(`
            // ${feature.properties.mint} (${feature.properties.hoard})<br>
            // ${feature.properties.count} / ${feature.properties.totalCount} (${percent.toFixed(2)}%)
            // ` , { sticky: true })
        }

        return marker
    }


    extendBorder(marker, feature, func) {
        if (feature.properties.extendBorder) {
            let original = marker
            original.setStyle(feature.properties.style)
            marker = L.featureGroup()
            marker.original = original
            marker.addLayer(original)
            const border = func()
            feature.properties.style = { fill: false }
            border.setStyle({ fill: false, opacity: 0, weight: feature.properties.extendBorder })
            border.addTo(marker)
            border.bringToFront()
        }
        return marker
    }


    createCircle(latlng, feature, { selections, markerOptions }) {

        let marker = null
        if (feature?.properties?.count > 0) {
            marker = this.createRectMarker(latlng, feature, { selections, markerOptions })
            marker = this.extendBorder(marker, feature, this.createRectMarker.bind(this, latlng, feature))
        } else {

            if (!markerOptions) markerOptions = {}
            marker = super.createCircle(latlng, feature, { selections, markerOptions })

            marker = this.extendBorder(marker, feature, () => super.createCircle(latlng, feature, { selections, markerOptions }))

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
        let marker
        if (feature?.properties?.isFocus) {
            marker = L.circleMarker(latlng, { radius: 15, fill: false, color: "red", weight: 3 })
        } else {
            // Use the area as value for the radius
            marker = this.createRectMarker(latlng, feature)
            marker = this.extendBorder(marker, feature, this.createRectMarker.bind(this, latlng, feature))
        }
        return marker

    }

    repaint() {
        if (this.graphicsLayer) {
            this.graphicsLayer.off('mouseover', this.bringTreasureToFront)
        }
        // We need to do this beforehand to fill the mintGeometryMap ...
        this.mintFeatureGroup = this.updateMintLocationMarker(...arguments)

        // ... the repaint recreates the layer object, so we need to readd the mintFeatureGroup ...
        super.repaint(...arguments)


        if (this.graphicsLayer) {
            this.graphicsLayer.on('mouseover', this.bringTreasureToFront)
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