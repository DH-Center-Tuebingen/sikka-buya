import URLParams from '../../../utils/URLParams';

var L = require('leaflet');


export default {
    data: function () {
        return {
            featureGroup: L.layerGroup()
        }
    },
    props: {
        map: Object
    },
    watch: {
        map: function () {
            this.mapChanged()
        }
    },
    computed: {
        L: function () {
            return L;
        },
        mapOptions() {
            let options = {}
            if (this.map) {
                options.zoom = this.map.getZoom();
                const latlng = this.map.getCenter();
                options.location = URLParams.toStringArray(
                    [latlng.lat, latlng.lng].map((val) => val.toFixed(5))
                );
            }

            return options
        }
    },
    mounted: function () {
        if (this.map) {
            this.map.doubleClickZoom.disable();
            this.featureGroup.addTo(this.map)
        }
    },
    unmounted: function () {
        this.featureGroup.clearLayers()

    },
    methods: {
        // We moved this from the computed components to the methods, because
        // it is dependend on the map object and not reactive if the map object
        // changes.
        getMapOptions() {
            let options = {}
            if (this.map) {
                options.zoom = this.map.getZoom();
                const latlng = this.map.getCenter();
                options.location = URLParams.toStringArray(
                    [latlng.lat, latlng.lng].map((val) => val.toFixed(5))
                );
            }
            return options
        },
        update: function () {
            throw new Error("Map mixin requires an update method!")
        },
        mapChanged: function () {
            if (this.map) {
                this.map.doubleClickZoom.disable();
                this.featureGroup.addTo(this.map)
            }
        },
        clearLayers: function () {
            this.featureGroup.clearLayers()
        },
        setLoading(isLoading) {
            this.$emit('loading', isLoading);
        },
    }
}