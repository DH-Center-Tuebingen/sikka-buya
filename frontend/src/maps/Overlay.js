import L from "leaflet"
import { RequestGuard } from '../utils/Async.mjs';

export default class Overlay {

    constructor(parent, settings, {
        onDataTransformed = null,
        onGeoJSONTransform = null,
        onApplyData = null
    } = {}) {
        this.data = {}
        this.parent = parent
        this.settings = settings
        this.fetchGuard = new RequestGuard(this.fetch.bind(this))
        this._onDataTransformed = onDataTransformed
        this._onGeoJSONTransform = onGeoJSONTransform
        this._onApplyData = onApplyData
    }



    async guardedFetch(filters) {
        return this.fetchGuard.exec(filters)
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
        if (this.layer)
            this.layer.remove()
    }

    async repaint({
        selections = {},
        markerOptions = {},
    } = {}) {
        this.clearLayer()

        const { geoJSON = [], patterns = [] } = this.toMapObject(this.data, selections)
        if (this._onGeoJSONTransform)
            this._onGeoJSONTransform(geoJSON)

        patterns.forEach(pattern => pattern.addTo(this.parent._map))

        const that = this
        this.layer = new L.geoJSON(geoJSON, Object.assign({}, {
            pointToLayer: function (feature, latlng) {
                return that.createMarker.call(that, latlng, feature, { selections, markerOptions })
            },
            coordsToLatLng: function (coords) {
                return new L.LatLng(coords[0], coords[1], coords[2]);
            }
        }, this.geoJSONOptions));

        this.layer.addTo(this.parent)
    }


    async update({
        filters = {},
        selections = {},
        markerOptions = {},
    } = {}) {
        const data = await this.guardedFetch(filters)
        if (!data) return null

        const transformedData = this.transform(data)
        if (this._onDataTransformed)
            this._onDataTransformed(transformedData)

        this.setData(transformedData)

        this.repaint({
            filters,
            selections,
            markerOptions
        })

    }

    // Saves the data for future repaints
    setData(data) {
        if (this._onApplyData)
            data = this._onApplyData(data)
        this.data = data
    }


    get geoJSONOptions() {
        return {
            style: { fillOpacity: 1 }
        }
    }

}
