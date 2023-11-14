<template>
  <div class="map-page">
    <transition name="fade">
      <loading-spinner v-if="loading" />
    </transition>
    <div class="map-view-container">
      <map-view
        class="mapview"
        :location="mapSettings.location"
        :zoom="mapSettings.zoom"
        ref="map"
        @ready="mapChanged"
        @moved="mapMoved"
      >
      </map-view>

      <router-view
        :map="map"
        @reset="resetMapSettings"
        @loading="setLoading"
      />
    </div>


    <crosshair
      v-if="showDebugCrosshair"
      :center="center"
    />
  </div>
</template>

<script>
import Settings from '../../settings';
require('leaflet-semirings');
require('../../plugins/leaflet-svg-icon');

import URLParams from '../../utils/URLParams';
import Crosshair from '../debug/Crosshair.vue';

import MapView from '../map/MapView.vue';
import LoadingSpinner from '../misc/LoadingSpinner.vue';

let querySettings = {
  zoom: URLParams.getInteger('zoom'),
  location: URLParams.getArray('location'),
};

for (let [key, val] of Object.entries(querySettings)) {
  if (val == null) delete querySettings[key];
}

const settings = new Settings(window, 'Map');
const localSettings = settings.load();
const mapSettings = Object.assign({}, localSettings, querySettings);

export default {
  name: 'MapPage',
  components: { MapView, LoadingSpinner, Crosshair },
  data: function () {
    return {
      map: null,
      center: { lat: 0, lng: 0 },
      types: [],
      mapSettings,
      loading: false,
      showDebugCrosshair: false
    };
  },
  created() { 
    let queryObject = URLParams.getMany({
      zoom: 'int',
      location: 'array',
    });

    this.$data.mapSettings = Object.assign({}, this.mapSettings, queryObject);
  },
  mounted() {
    settings.onSettingsChanged((keyValPairs) => {
      keyValPairs.forEach(([key, val]) => {
        this.$data.mapSettings[key] = val;
      });
    });

    this.$nextTick(() => {
      this.map.on('moveend', this.updateMapSettings);
    });
  },
  beforeDestroy() {

    this.map.off('moveend', this.updateMapSettings);

    this.map.eachLayer((layer) => {
      this.map.removeLayer(layer)
    })
  },
  methods: {
    mapChanged(map) {
      this.map = map;
      this.updateCenter(map.getCenter());
    },
    mapMoved(e) {
      const latLng = e.target.getCenter()
      this.updateCenter(latLng);
    },
    updateCenter(latLng) {
      this.center = latLng;
    },
    updateMapSettings(args) {
      const { target: map } = args;
      const { lat, lng } = map.getCenter();

      settings.multiChange([
        ['location', [lat, lng]],
        ['zoom', map.getZoom()],
      ]);
    },
    resetMapSettings() {
      settings.reset();
      this.map.setView(this.mapSettings.location, this.mapSettings.zoom, {
        animation: true,
      });
    },
    setLoading(isLoading) {
      this.loading = isLoading;
    },
  },
};
</script>

<style lang="scss">
.map-page {
  height: 100vh;

  #back-button>a {
    display: inline-flex;

    >.material-design-icon {
      margin-right: 2 * $padding;
    }

    padding-right: $padding;
  }

  .spinner {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 10000;
    color: white;

    transform: scale(0.5) translateX(-50%, -50%);

    >* {
      box-shadow: 0 0 3px red;
    }
  }

  .side-bar {
    @media screen and (max-width: 720px) {
      position: absolute;
      display: none !important;
    }

    grid-row: 1 / span 3;

    .title {
      display: flex;

      h3 {
        color: $gray;
        text-align: center;
        font-size: $regular-font;
        margin-bottom: 0;
        flex: 1;
      }
    }

    z-index: 100;

    ul:not(.search-box) {
      margin: 0;
      padding: 0;
      list-style-type: none;
      overflow: hidden;

      li {
        padding: 0.1rem .5rem;
        cursor: pointer;
        // box-sizing: border-box;
        // border: 1px solid transparent;
        user-select: none;

        &.inactive {
          opacity: 0.5;
        }
      }
    }

    .collapsible-header {
      margin-right: $padding;
    }

    .collapsible-content {
      background-color: rgba($color: #000000, $alpha: 0.05);
    }
  }

  .side-bar-right {

    .select-list-item,
    .selected-but-unavailable {
      transition: background-color 0.3s;
      // background-color: initial;

      // > * {
      //   color: black;
      // }

      span {
        align-self: center;
      }
    }
  }

  .timeline {
    // max-width: 400px;
    width: 100%;

    .slider {
      color: $primary-color;
    }
  }

  .timeline-canvas {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .ui {
    position: absolute;
    top: 0;
    // background-color: red;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 5fr 1fr;

    @media screen and (max-width: 1080px) {
      grid-template-columns: 1fr 2fr 1fr;
    }

    @media screen and (max-width: 720px) {
      grid-template-columns: 0fr 2fr 0fr;
    }

    grid-template-rows: 120px 3fr auto;

    pointer-events: none;

    >* {
      pointer-events: auto;
    }
  }

  .center-ui {
    grid-column: 2;
    position: relative;
    pointer-events: none;

    // >* {
    //   pointer-events: auto;
    // }

    &.center-ui-top {
      grid-row: 1;

      z-index: 100;
    }

    &.center-ui-center {
      grid-row: 2;
      pointer-events: none;
      z-index: 100;
    }

    .ui-element-container {
      >* {
        pointer-events: all;
      }
    }

    .ui-element {
      pointer-events: all;
    }

    &.center-ui-bottom {
      grid-row: 3;
      display: flex;
      z-index: 100;
    }
  }

  .leaflet-container .leaflet-control-attribution {
    position: fixed;
    bottom: 0;
    left: 50%;
    width: 100%;
    text-align: center;
    transform: translateX(-50%);
    background-color: white;
    color: $gray;
    z-index: 1000;
    font-size: 0.6rem !important;
  }
}
</style>

<style lang="scss" scoped>
.clear-filter-btn {
  margin: 3px;
  @include buttonColor($primary-color, rgba($white, 0.8));

  font-weight: bold;
  text-align: center;
  border-radius: $border-radius;
  justify-content: center;
  padding: $padding $big-padding * 2;
  border: none;
  box-shadow: 0 0 10px $primary-color;
}

.map-view-container {
  position: relative;
  flex: 1;
}

.map-page {
  position: relative;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
}

.mapview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.map-label {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-weight: bold;
  font-size: 22px;
  margin-bottom: 10px;

  &::before {
    border-top-color: transparent !important;
  }
}

#mints {
  li {
    margin-bottom: 0;
  }
}

.selected {
  color: $primary-color;
}

.side-bar-right {
  right: 0;
}

.notification {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  color: $white;
  background-color: $primary-color;
  margin-top: 10px;
  padding: 5px 10px;
  border-radius: $border-radius;
  display: flex;
  align-items: center;

  button {
    margin-left: 10px;
    padding: 3px 10px;
    border-radius: $border-radius;
    background-color: $primary-color;
    color: $white;
    border-color: $white;
  }
}

#map-select {
  left: 50%;
  z-index: 1;
  position: absolute;
  top: 55px;
  display: flex;
  transform: translateX(-50%);
}
</style>
