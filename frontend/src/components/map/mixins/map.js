import Mixin from '../../../utils/Mixin';
import URLParams from '../../../utils/URLParams';

var L = require('leaflet');


const mixin = new Mixin("map_mixin")
const vue = {
    data: function () {
        return {
            featureGroup: L.layerGroup()
        }
    },
    props: {
        map: Object
    },
    watch: {
        map: function (newMap, oldMap) {
            this.mapChanged(newMap, oldMap)
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
    mounted() {
        this.mapChanged()
    },
    beforeDestroy() {
        this.featureGroup.clearLayers()
        this.map.off("click", this[mixin.member("click")])
    },
    methods: {
        [mixin.member("click")]: function (e) {
            if (e.originalEvent.ctrlKey) {
                // Copy coordinates to clipboard
                const latlng = e.latlng;
                const coords = [latlng.lat, latlng.lng].map((val) => val.toFixed(5));
                const text = coords.join(", ");
                navigator.clipboard.writeText(text);

                console.log("Copied coordinates to clipboard: " + text)
            }
        },
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
        mapChanged: function (newMap, oldMap) {
            if (this.map) {
                this.map.doubleClickZoom.disable();
                this.featureGroup.addTo(this.map)

                if (oldMap) {
                    oldMap.off("click", this[mixin.member("click")])
                }

                this.map.on("click", this[mixin.member("click")])
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

export default vue