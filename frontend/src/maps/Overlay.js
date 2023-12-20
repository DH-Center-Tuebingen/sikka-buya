import L from '@/leaflet'
import { RequestGuard } from '../utils/Async.mjs';

export default class Overlay {

    constructor(parent, settings, {
        additionalData = {},
        onDataTransformed = null,
        onGeoJSONTransform = null,
        onFetch = null,
        onApplyData = null,
        onEnd = null,
        onFeatureGroupAdded = null,
        onFeatureGroupRemoved = null,
    } = {}) {
        this.data = {}
        this.parent = parent
        this.settings = settings
        this.fetchGuard = new RequestGuard(this.fetch.bind(this))
        this.additionalData = additionalData
        this._onDataTransformed = onDataTransformed
        this._onGeoJSONTransform = onGeoJSONTransform
        this._onApplyData = onApplyData
        this._onEnd = onEnd
        this._onFetch = onFetch
        this._onFeatureGroupAdded = onFeatureGroupAdded
        this._onFeatureGroupRemoved = onFeatureGroupRemoved

        this.clearLayer()
    }

    async guardedFetch(data) {
        return this.fetchGuard.exec(data)
    }

    /** Fetches the data from the server. */
    async fetch() {
        console.error("Error in Overlay: Abstract method not overloaded: fetch().")
    }

    /**
     * Transforms the data into an appropriate form.
     */
    transform() {
        console.error("Error in Overlay: Abstract method not overloaded: transform().")
    }

    /**
     * Takes the transformed data and translates it into GeoJSON format.
     * The additional data of each feature should be stored at the object at'feature.data'.
     * Called on ever repaint.
     */
    toMapObject() {
        console.error("Error in Overlay: Abstract method not overloaded: toMapObject().")
    }

    /**
     * Draws the marker onto the map.
     */
    createMarker() {
        console.error("Error in Overlay: Abstract method not overloaded: createMarker().")
    }

    /*
    * Draws the circle onto the map.
    */
    createCircle(latlng, feature, { selections, markerOptions }) {
        return new L.Circle(latlng, feature.properties.radius, markerOptions)
    }

    parseGeoJSON(result) {
        if (result.mint) {
            for (let idx in result.mint) {
                result.mint[idx] = this._parseGeoJson(result.mint[idx])
            }
        }

        if (result.type) {
            for (let idx in result.type) {
                if (result.type[idx].mint) {
                    result.type[idx].mint = this._parseGeoJson(result.mint[idx])
                }
            }
        }

        return result
    }

    _parseGeoJson(el) {
        if (el.location) {
            try {
                el.location = JSON.parse(el.location);
            } catch (e) {
                console.error('Could not parse GeoJSON.', el.location);
            }
        }
        return el
    }

    clearLayer() {
        if (this.layer) {

            // Here we can cleanup event listeners added to children
            const children = this.layer.getLayers()
            children.forEach(child => {
                if (this._onFeatureGroupRemoved)
                    this._onFeatureGroupRemoved(child)
                child.remove()
            })

            this.layer.remove()
        }
        this.layer = L.featureGroup()
    }

    async repaint({
        selections = {},
        markerOptions = {},
    } = {}) {
        this.clearLayer()

        const data = this.toMapObject(this.data, selections)
        const geoJSON = data.geoJSON
        if (this._onGeoJSONTransform && data.geoJSON)
            this._onGeoJSONTransform(geoJSON)

        const patterns = data.patterns || []
        patterns.forEach(pattern => pattern.addTo(this.parent._map))
        this.createGeometry(data, { selections, markerOptions })
        this.layer.addTo(this.parent)
    }

    createGeometry({ geoJSON = null } = {}, { selections, markerOptions } = {}) {
        if (!geoJSON) {
            throw new Error("No geoJSON provided.")
        }
        const that = this
        if (!Array.isArray(geoJSON)) geoJSON = [geoJSON]
        geoJSON.forEach(feature => {
            let group = new L.geoJSON(feature, Object.assign({}, {
                pointToLayer: function (feature, latlng) {
                    const radius = parseInt(feature?.properties?.radius)
                    if (!isNaN(radius)) {
                        return that.createCircle.call(that, latlng, feature, { selections, markerOptions })
                    } else {
                        return that.createMarker.call(that, latlng, feature, { selections, markerOptions })
                    }
                },
                coordsToLatLng: function (coords) {
                    return new L.LatLng(coords[0], coords[1], coords[2]);
                }
            }, this.geoJSONOptions));

            this._addFeatureGroup(group)
        })
    }

    _addFeatureGroup(group) {
        group.addTo(this.layer)
        if (this._onFeatureGroupAdded)
            this._onFeatureGroupAdded(group)
    }


    // ON REFACTOR: Params should be a single object. 
    async update({
        filters = {},
        selections = {},
        markerOptions = {},
    } = {}) {
        const data = await this.guardedFetch({ filters, selections })
        if (this._onFetch) this._onFetch(data)
        if (!data) return null

        const transformedData = this.transform(data, selections)
        if (this._onDataTransformed)
            this._onDataTransformed(transformedData)

        this.setData(transformedData)

        this.repaint({
            filters,
            selections,
            markerOptions
        })

        if (this._onEnd)
            this._onEnd()
    }

    // Saves the data for future repaints
    setData(data) {
        data = this.filter(data)

        if (this._onApplyData)
            data = this._onApplyData(data)
        this.data = data
    }

    filter(data) {
        // Can be overloaded in subclass
        return data
    }


    get geoJSONOptions() {
        return {
            style: { fillOpacity: 1 }
        }
    }

}
