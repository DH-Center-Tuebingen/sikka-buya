import L from '@/leaflet'

export default class DataPainter {

    constructor(parent, {
        onTransform = null,
        createMarker = null
    }) {
        this.parent = parent
        this.layer = null
        this.onTransform = onTransform
        this.createMarker = createMarker
    }

    update(geoJson) {
        if (this.onTransform)
            geoJson = this.onTransform(geoJson)

        if (this.layer)
            this.layer.remove()

        const that = this
        this.layer = new L.geoJSON(geoJson, {
            pointToLayer: function (feature, latlng) {
                return that.createMarker.call(that, latlng, feature)
            },
            coordsToLatLng: function (coords) {
                return new L.LatLng(coords[0], coords[1], coords[2]);
            }
        });
        this.layer.addTo(this.parent)
    }
}
