<template>
  <div
    class="location-input"
    @keydown="keydown($event)"
    @focus.capture="focus()"
    @blur.capture="unfocus()"
    :class="{ focused, interactive }"
    ref="root"
  >
    <div class="toolbar">
      <div class="input-wrapper">
        <select
          v-if="interactive"
          :value="extendedType.toLowerCase()"
          @change="typeChange"
        >
          <option value="point">
            <Locale path="location.point" />
          </option>
          <option value="polygon">
            <Locale path="location.polygon" />
          </option>
          <option
            value="circle"
            v-if="allowCircle"
          >
            <Locale path="location.circle" />
          </option>
        </select>
        <label
          v-else
          for="input"
        >{{ type.toUpperCase() }}</label>
        <input
          v-if="extendedType === 'circle'"
          type="range"
          :value="getRadius()"
          @input="($event) => this.updateRadius(parseFloat($event.target.value))"
          min="1000"
          max="1000000"
          step="1000"
        />
        <input
          ref="input"
          class="location-input-field"
          type="text"
          :value="coordinateString"
          @input="resetInputText()"
        />
        <Button
          v-if="type === 'point'"
          class="ghost-btn"
          @click="pasteEvt"
        >
          <ContentPaste />
        </Button>
      </div>

      <button
        type="button"
        class="delete-btn"
        @click.prevent.stop="clear()"
      >
        <Close />
      </button>
    </div>
    <div class="map">
      <map-view
        ref="map"
        height="500px"
        :location="[29.99300228455108, 50.96557617187501]"
        :zoom="5"
        tabindex="0"
      />
      <div class="legend">
        <ul>
          <li><b>STRG + Linksklick:</b> Punkt setzen</li>
          <li><b>STRG + Z:</b> Vorherige Punkt wiederherstellen</li>
          <li><b>ENTF:</b> Entfernt aktiven Punkt (nur Polygon)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Close from 'vue-material-design-icons/Close.vue';
import ContentPaste from 'vue-material-design-icons/ContentPaste.vue';
import Button from '../layout/buttons/Button.vue';
import MapView from '../map/MapView.vue';

import Locale from '../cms/Locale.vue';

var L = require('leaflet');
export default {
  name: 'LocationInput',
  components: {
    Locale,
    MapView,
    Close,
    Button,
    ContentPaste,
  },
  props: {
    interactive: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true
    },
    coordinates: {
      validator: (val) => val === null || Array.isArray(val),
      required: true,
    },
    properties: {
      type: Object,
      default: () => ({}),
    },
    allowCircle: {
      type: Boolean,
      default: false,
    }
  },
  watch: {
    properties: {
      handler() {
        this.updateMarker();
      },
      deep: true
    },
    coordinates: function () {
      this.updateMarker();
    },
  },
  data: function () {
    return {
      polygonPointRadius: 8,
      activeMarkerIndex: null,
      focused: false,
      location: null,
      marker: null,
      handles: [],
      lineHandles: [],
      markerHistory: [],
      historyLimit: 20,
      updateString: 0,
    };
  },
  /**
   * Child components are mounted before the parent component.
   * So we can access the map in the mounted function.
   */
  mounted: function () {
    this.$refs.input.addEventListener('paste', this.pasteEvtListener);

    this.enableMap();
    this.updateMarker();
  },
  unmounted: function () {
    this.$refs.input.removeEventListener('paste', this.pasteEvtListener);
  },
  methods: {
    // If we work with a circle we need to create a
    // Feature from the provided object, as currently only
    // the geometry object is supported.
    // This is a hack and would require a 
    // complete bigger restructuring.
    // TODO: Remove when Features are supported
    getGeoJSON() {
      if (this.extendedType === "circle") {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: this.coordinates
          },
          properties: this.properties
        }
      } else {
        return {
          type: this.type,
          coordinates: this.coordinates
        }
      }
    },
    typeChange(event) {
      let type = event.target.value

      let properties = this.properties
      if (type === "circle") {
        type = "point"
        properties = { radius: 3000 }
      } else if (type === "point") {
        properties = {}
      }

      this.clear({ type, properties })
    },
    async pasteEvtListener(evt) {
      let paste = (evt.clipboardData || window.clipboardData).getData('text');
      this.paste(paste);
    },
    pasteEvt: async function () {
      this.$refs.input.focus();
      let text = await navigator.clipboard.readText();
      this.paste(text);
    },
    paste(text) {
      try {
        let arr = text.split(', ');
        arr = arr.map((el) => el.replace(',', '.'));
        if (
          arr.length == 2 &&
          !isNaN(parseFloat(arr[0])) &&
          !isNaN(parseFloat(arr[1]))
        ) {
          const coords = { lat: parseFloat(arr[0]), lng: parseFloat(arr[1]) };
          this.addPoint(coords);
        } else {
          console.error('Wrong format of paste.');
        }
      } catch (e) {
        console.error(e);
      }
    },
    resetInputText: function () {
      // This is a hack to update the computed property.
      // The value is just referenced in the computed function
      // and as it changes, it will trigger the computed function
      // to reevaluate.
      this.updateString++;
    },
    setActiveMarker: function (i) {
      let old = this.activeMarkerIndex;

      if (old != null) {
        this.handles[old].setStyle({
          fillColor: '#3388ff',
        });
      }

      this.activeMarkerIndex = i;
      this.handles[this.activeMarkerIndex].setStyle({
        fillColor: '#ff0000',
      });

      this.updateMarker();
    },
    focus() {
      this.focused = true;
    },
    unfocus() {
      this.focused = false;
      this.activeMarkerIndex = null;
      this.updateMarker();
    },
    keydown(e) {
      if (this.coordinates == null) return;

      if (this.focused) {
        if (e.ctrlKey && e.key.toLowerCase() == 'z') {
          let prevPosition;
          if (this.markerHistory.length > 0) {
            prevPosition = this.markerHistory.shift();
          }

          if (prevPosition) {
            let coordinates = this.coordinates;
            switch (prevPosition.action) {
              case 'set': {
                if (!this.isPolygon) {
                  coordinates = prevPosition.coordinates;
                } else {
                  if (coordinates.length > 0) coordinates.pop();
                }
                break;
              }
              case 'move': {
                coordinates.splice(
                  prevPosition.index,
                  1,
                  prevPosition.coordinates
                );
                break;
              }
              case 'insert': {
                coordinates.splice(prevPosition.index, 1);
                break;
              }
              case 'remove': {
                coordinates.splice(
                  prevPosition.index,
                  0,
                  prevPosition.coordinates
                );
                break;
              }
            }

            this.emitUpdate({ coordinates });
          }
        }

        if (
          (e.key.toLowerCase() == 'backspace' ||
            e.key.toLowerCase() == 'delete') &&
          this.activeMarkerIndex != null
        ) {
          const coordinates = this.coordinates;

          this.markerHistory.unshift({
            action: 'remove',
            index: this.activeMarkerIndex,
            coordinates: coordinates[this.activeMarkerIndex],
          });

          coordinates.splice(this.activeMarkerIndex, 1);
          this.activeMarkerIndex = null;
          this.emitUpdate({ coordinates });
        }
      }
    },
    clear({ type = this.type, properties = this.properties } = {}) {
      let coordinates = null
      if (type.toLowerCase() == "polygon") {
        coordinates = [];
      }
      this.emitUpdate({ coordinates, type, properties });
    },
    enableMap() {
      this.map = this.$refs.map.map;
      this.map.doubleClickZoom.disable();

      this.map.on('click', (e) => {
        if (e.originalEvent.ctrlKey == true) {
          const location = e.latlng;
          this.addPoint(location);
        }
      });
    },
    addPoint(location) {
      let coordinates = this.coordinates == null ? [] : this.coordinates;
      if (this.isPolygon) {
        coordinates.push([location.lat, location.lng]);
      } else {
        coordinates = [location.lat, location.lng];
      }

      this.markerHistory.unshift({
        action: 'set',
        coordinates: [location.lat, location.lng],
      });

      while (this.markerHistory.length > this.historyLimit)
        this.markerHistory.pop();

      this.emitUpdate({ coordinates });
    },
    removeMarker() {
      if (this.marker) {
        this.marker.remove();
        this.marker = null;

        this.handles.forEach((element) => {
          element.remove();
        });
        this.handles = [];

        this.lineHandles.forEach((el) => el.remove());
        this.lineHandles = [];
      }
    },
    drawLineHandles() {
      if (this.coordinates !== null && this.coordinates.length > 1) {
        this.coordinates.forEach((point, idx) => {
          let nextPoint = this.coordinates[(idx + 1) % this.coordinates.length];

          let lineHandle = L.polyline([point, nextPoint], {
            color: '#ff0000',
            weight: 15,
            opacity: 0,
          }).addTo(this.map);

          lineHandle.on('mousedown', (evt) => {
            const point = [evt.latlng.lat, evt.latlng.lng];

            const coordinates =
              this.coordinates == null ? [] : this.coordinates;
            coordinates.splice(idx + 1, 0, point);

            this.markerHistory.unshift({
              action: 'insert',
              index: idx + 1,
            });

            this.updateMarker();
            this.setActiveMarker(idx + 1);
            this.handles[this.activeMarkerIndex].fire('mousedown', evt);

            this.emitUpdate({ coordinates });
          });

          this.lineHandles.push(lineHandle);
        });
      }
    },
    updateRadius(radius) {
      let properties = Object.assign(this.properties, { radius })
      this.emitUpdate({ properties });
    },
    emitUpdate({
      coordinates = this.coordinates,
      type = this.type,
      properties = this.properties
    } = {}) {
      this.$emit('update', {
        type,
        coordinates,
        properties
      });
    },
    updateMarker() {
      this.removeMarker();
      if (this.coordinates == null) {
        return;
      } else if (this.coordinates.length > 0) {
        if (this.isPolygon) {
          this.marker = L.polygon(this.coordinates).addTo(this.map);

          this.drawLineHandles();

          this.handles = this.coordinates.map((point, i) => {
            let marker = L.circleMarker(point, {
              radius: this.polygonPointRadius,
              fillOpacity: 1,
              fillColor: this.activeMarkerIndex == i ? '#ffffff' : '#3388ff',
              draggable: true,
            }).addTo(this.map);

            let trackCursor = (evt) => {
              if (this.activeMarkerIndex != null) {
                let a = this.activeMarkerIndex;
                let b =
                  this.activeMarkerIndex - 1 < 0
                    ? this.lineHandles.length - 1
                    : a - 1;

                const marker = this.handles[this.activeMarkerIndex];
                const location = evt.latlng;
                marker.setLatLng(location);
                this.coordinates[a] = [location.lat, location.lng];

                for (let [handle, point] of [
                  [a, 0],
                  [b, 1],
                ]) {
                  let polyPoints = this.lineHandles[handle].getLatLngs();
                  polyPoints[point] = location;
                  this.lineHandles[handle].setLatLngs(polyPoints);
                }

                this.updateMarker();
              }
            };

            marker.on('mousedown', (e) => {
              this.map.dragging.disable();
              this.setActiveMarker(i);

              let location = e.latlng;
              this.markerHistory.unshift({
                action: 'move',
                index: i,
                coordinates: [location.lat, location.lng],
              });

              this.map.on('mousemove', trackCursor);
              e.originalEvent.preventDefault();
            });

            this.map.on('mouseup', () => {
              this.map.dragging.enable();
              this.map.off('mousemove', trackCursor);
              if (this.activeMarkerIndex !== null)
                this.coordinates.splice(0, 0);
            });

            return marker;
          });
        } else if (this.type === "point" && this.properties.radius != null) {
          const defaultMarker =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=';

          const defaultMarkerShadow =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC';

          let defaultIcon = new L.Icon({
            iconUrl: defaultMarker,
            iconAnchor: [12, 41],
            shadowUrl: defaultMarkerShadow,
          });

          const marker = L.marker(this.coordinates, {
            icon: defaultIcon,
          })

          console.log(this.getRadius(), this.properties.radius)
          const circlePolygon = L.circle(this.coordinates, {
            radius: this.getRadius(),
          })

          this.marker = L.featureGroup([marker, circlePolygon]).addTo(this.map);

        } else {
          const defaultMarker =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=';

          const defaultMarkerShadow =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC';

          let defaultIcon = new L.Icon({
            iconUrl: defaultMarker,
            iconAnchor: [12, 41],
            shadowUrl: defaultMarkerShadow,
          });

          this.marker = L.marker(this.coordinates, {
            icon: defaultIcon,
          }).addTo(this.map);
        }
      }
    },
    createStringArray(arr) {
      const values = [];
      let str = '[';
      arr.forEach((val, idx) => {
        values.push(val.toFixed(2));
      });
      str += values.join(', ');
      return str + ']';
    },
    sizeChanged() {
      this.$refs.map.map.invalidateSize();
    },
    getRadius() {
      return this.properties?.radius || 0
    }
  },
  computed: {
    extendedType() {
      if (this.type === "point" && this.properties.radius != null) {
        return "circle"
      } else {
        return this.type
      }
    },
    isPolygon() {
      return this.type.toLowerCase() == 'polygon';
    },
    lat: function () {
      if (this.coordinates == null || this.coordinates.length == 0) {
        return '-';
      } else {
        return this.coordinates[0];
      }
    },
    lng: function () {
      if (this.coordinates == null || this.coordinates.length == 0) {
        return '-';
      } else {
        return this.coordinates[1];
      }
    },
    coordinateString: function () {
      this.updateString;
      switch (this.type.toLowerCase()) {
        case 'polygon':
          return this.polygonString;
        case 'point':
          return this.pointString;
        default:
          console.error(`Undefined type in coordinateString ${this.type}!`);
          return 'undefined';
      }
    },
    polygonString: function () {
      if (this.coordinates == null) return '';
      return JSON.stringify(this.coordinates, (key, arr) => {
        const childArrays = [];
        arr.forEach((coordinates, pos) => {
          childArrays.push(this.createStringArray(coordinates));
        });
        return `[${childArrays.join(', ')}]`;
      }).slice(1, -1); // The slice returns the " at start and end of string
    },
    pointString: function () {
      if (this.coordinates == null || this.coordinates.length < 2) return '';
      else return this.createStringArray(this.coordinates);
    }
  },
};
</script>



<style lang="scss" scoped>
.toolbar {
  display: flex;

  >button {
    border-top-width: 0;
    border-right-width: 0;
  }

  >div {
    position: relative;
    flex: 1;
    display: flex;

    >input {
      flex: 1;
    }

    >*,
    > :first-child {
      border-top-width: 0;
      border-right-width: 0;
    }

    >label {
      // position: absolute;
      // top: 0;
      // bottom: 0;
      // left: 0;
      background-color: transparent;
      border: none;

      display: flex;
      align-items: center;
      padding: $padding;
      opacity: 0.5;
    }
  }
}

select {
  text-transform: uppercase;
  font-weight: 900;
  color: $gray;
}

.location-input {
  border: 1px solid rgb(204, 204, 204);
  padding: 0;
  box-sizing: border-box;
}

.focused {
  border: 1px solid $primary-color;
}

.map {
  position: relative;
}

.legend {
  position: absolute;
  bottom: 0;
  z-index: 1000;

  background-color: white;
  opacity: 0.8;

  ul {
    list-style-type: none;
    margin: $padding;
    padding: 0;

    li {
      margin: 0;
    }
  }
}
</style>
