<template>
  <div
    :id="'map_' + _uid"
    ref="map"
  >
    <template v-if="ready">
      <slot />
    </template>
  </div>
</template>

<script>
var L = require('leaflet');
var _ = require('lodash');
require('leaflet.pattern');

import Simplebar from 'simplebar';

import('/node_modules/leaflet/dist/leaflet.css');

import LeafletSmoothZoom from '../../vendor/leafletsmoothzoom';
LeafletSmoothZoom(L);

export default {
  name: 'MapView',
  props: {
    useBoundaries: {
      type: Boolean,
      default: true,
    },
    height: String,
    location: {
      type: Array,
      required: true,
    },
    zoom: {
      type: Number,
      required: true,
    },
  },
  data: function () {
    return {
      map: null,
      ready: false,
    };
  },
  computed: {
    L() {
      return L;
    },
  },
  mounted: function () {
    let mapBoundaries = null;
    if (this.useBoundaries) {
      const minBoundingPoint = L.latLng(10, 10);
      const maxBoundingPoint = L.latLng(50, 90);
      mapBoundaries = L.latLngBounds(minBoundingPoint, maxBoundingPoint);
    }

    L.Map.include({
      _initControlPos: function () {
        var corners = (this._controlCorners = {}),
          l = 'leaflet-',
          container = (this._controlContainer = L.DomUtil.create(
            'div',
            l + 'control-container',
            this._container
          ));

        function createCorner(vSide, hSide) {
          var className = l + vSide + ' ' + l + hSide;

          corners[vSide + hSide] = L.DomUtil.create(
            'div',
            className,
            container
          );
        }

        createCorner('top', 'left');
        createCorner('top', 'right');

        createCorner('bottom', 'left');
        createCorner('bottom', 'right');

        createCorner('middle', 'left');
        createCorner('middle', 'right');

        createCorner('top', 'center');
        createCorner('middle', 'center');
        createCorner('bottom', 'center');
      },
    });


    // Initialize the map 
    var map = L.map('map_' + this._uid, {
      center: this.location,
      zoom: this.zoom,
      minZoom: 3,
      maxBounds: mapBoundaries,
      zoomControl: false,
      scrollWheelZoom: false, // disable original zoom function
      smoothWheelZoom: true, // enable smooth zoom
      smoothSensitivity: 1, // zoom speed. default is 1 
    });

    map.on('popupopen', this.popupOpened);
    map.on('move', this.mapMoved);

    if (this.height) {
      this.$refs.map.style.height = this.height;
      map.invalidateSize();
    }

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 17,
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }
    ).addTo(map);

    map.attributionControl.setPrefix('Build with Leaflet');

    this.$data.map = map;
    this.ready = true;

    this.$nextTick(() => {
      this.$emit('ready', map);
    });
  },
  beforeDestroy() {
    this.map.off('popupopen', this.popupOpened);
    this.map.off('move', this.mapMoved);

    this.map.remove();
  },
  methods: {
    popupOpened(e) {
      const _container = e.popup._container;
      const target = _container.querySelector('[make-simplebar]');

      if (!target) {
        console.warn(`No simplebar wrapper was found on the popup`);
      } else {
        const targetHTML = target.innerHTML;
        target.innerHTML = '';

        let wrapper = document.createElement('div');
        wrapper.innerHTML = targetHTML;
        wrapper.style.overflow = 'visible';
        wrapper.classList.add(...target.className.split(' '));

        const simplebar = new Simplebar(target, { autoHide: false });
        const content = simplebar.getContentElement();
        content.appendChild(wrapper);

      }
    },
    mapMoved(e) {
      this.$emit('moved', e);
    },
  }
};
</script>

<style lang="scss">
.leaflet-top {
  z-index: 900;
}
</style>
