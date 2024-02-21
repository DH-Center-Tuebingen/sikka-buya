<template>
  <div class="page">
    <header>
      <h2>
        <Locale path="routes.Analytics Table" />
      </h2>

      <div class="select-row">
        <labeled-property label="X-Achse">
          <select @input="xChanged">
            <option
              v-for="(value, index) of availableProperties"
              :value="value.name"
              :key="index"
              :selected="value.name == x"
            >
              {{ $tc(value.locale) }}
            </option>
          </select>
        </labeled-property>
        <div
          class="button"
          style="flex: 0; padding 5px; margin: .5rem; display: flex; align-items: center; justify-content: center;"
          @click="swap"
        >
          <Icon
            type="mdi"
            :path="icons.mdiSwapHorizontal"
          />
        </div>
        <labeled-property label="Y-Achse">
          <select @input="yChanged">
            <option
              v-for="(value, index) of availableProperties"
              :value="value.name"
              :key="index"
              :selected="value.name == y"
            >
              {{ $tc(value.locale) }}
            </option>
          </select>
        </labeled-property>
        <!-- <labeled-property label="Skalierung">
          <slider
            :min="0"
            :max="1"
            :value="scale"
            @input="updateScale"
            :step="0.01"
          />
        </labeled-property> -->
      </div>
    </header>
    <div
      v-if="error"
      class="error"
    ></div>

    <div
      class="viewport"
      ref="viewport"
      @scroll.passive="pinTableHeaders($event)"
    >
      <table ref="table">
        <thead :style="{ height: availablePropertiesMap[x].space }">
          <tr>
            <td></td>
            <td
              v-for="(itemX, xIdx) of xValues"
              :key="'row-' + xIdx"
              :title="itemX"
            >
              <span class="rotated">
                {{ itemX }}
              </span>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(itemY, yIdx) in yValues"
            :key="'head-' + yIdx"
          >
            <td
              :style="{ width: availablePropertiesMap[y].space }"
              :title="itemY"
            >{{ itemY }}</td>
            <td
              v-for="(itemX, xIdx) of xValues"
              v-bind:key="'cell-' + yIdx + '-' + xIdx"
              class="color-box"
              :style="getColumnStyle(itemX, itemY)"
              :class="{ exists: getTypesFromMap(itemX, itemY).length != 0 }"
              :title="`${yValues[yIdx]} - ${xValues[xIdx]}: ${getTypesFromMap(itemX, itemY).length}`"
            >
              <!-- {{ getTypesFromMap(itemX, itemY).length }} -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import Query from '../../../database/query';
import Slider from '../../forms/Slider.vue';
import LabeledProperty from '../../display/LabeledProperty.vue';
import RequestBuffer from '../../../models/request-buffer';
import Color from '../../../utils/Color';
import IconMixin from '../../mixins/icon-mixin.js';
import { mdiSwapHorizontal } from '@mdi/js';
import Locale from '../../cms/Locale.vue';

export default {
  components: {
    LabeledProperty,
    Slider,
    Locale
  },
  mixins: [IconMixin({ mdiSwapHorizontal })],
  name: 'YearMintTablePage',
  created: function () {
    this.fetchTypes();

    this.pinXBuffer = new RequestBuffer(25, { allowSame: true });
    this.pinYBuffer = new RequestBuffer(25, { allowSame: true });


    const property = (name, space = "5rem", locale = null) => {
      return {
        name: name,
        locale: locale || `property.${name}`,
        space,
      }
    }

    this.availableProperties = [
      property('yearOfMint', "3rem", 'property.year_of_mint'),
      property('mint', "15rem"),
      property('material'),
      property('nominal'),
    ]

    this.availablePropertiesMap = this.availableProperties.reduce((acc, cur) => {
      acc[cur.name] = cur;
      return acc;
    }, {});
  },
  data: function () {
    return {
      x: 'mint',
      y: 'yearOfMint',
      popupActive: false,
      popup: null,
      availableProperties: [],
      availablePropertiesMap: {},
      types: null,
      error: '',
      map: new Map(),
      mapMax: 0,
      densityMap: {},
      plainValues: ['yearOfMint'],
      nameObjects: ['mint', 'material', 'nominal'],
      scale: 1,
      pinXBuffer: null,
      pinYBuffer: null,
    };
  },
  methods: {
    swap() {
      const temp = this.x;
      this.x = this.y;
      this.y = temp;
      this.fetchTypes();
    },
    getColumnStyle(itemX, itemY) {
      return { backgroundColor: this.countColor(this.getTypesFromMap(itemX, itemY).length) }
    },
    updateScale(event) {
      this.scale = parseFloat(event.currentTarget.value);
      this.$refs.table.style.transformOrigin = 'top left';
      this.$refs.table.style.transform = `scale(${this.scale})`;

      this.pinTableHeaders();
    },
    async fetchTypes() {
      let page = 0;
      const requestSize = 100;
      let done = false;
      let types = [];
      try {
        while (!done) {
          const query = gql`
            {
              coinType(
                pagination: { count: ${requestSize}, page: ${page} },
                filters: {excludeFromTypeCatalogue: false}) {
                types {
                  projectId
                  ${this.getQuery(this.x)}
                   ${this.getQuery(this.y)}
                }
                pageInfo {
                  page
                  count
                  last
                }
              }
            }
          `;

          let results = await Query.gql(query);
          const properties = results?.data?.data?.coinType;
          const pageInfo = properties?.pageInfo;
          const _types = properties?.types;

          if (_types) {
            types.push(..._types);
          }

          if (!properties || !pageInfo || pageInfo.last === pageInfo.page) {
            done = true;
          }
          page++;
        }

        this.types = types.filter(type => {
          for (const key of [this.x, this.y]) {
            if (!type[key]) {
              return false;
            }

            if (typeof (type[key]) === 'string') {
              let val = type[key].trim();
              if (val === '' || val.toLowerCase() === 'null') {
                return false;
              }
            }
          }
          return true;
        });

        this.updateMap();
      } catch (e) {
        console.error('Could not fetch types: ', e);
      }
    },
    xChanged(event) {
      this.x = event.target.value;
      this.fetchTypes();
    },
    yChanged(event) {
      this.y = event.target.value;
      this.fetchTypes();
    },
    pinTableHeaders(event) {
      // const scrollLeft = this.$refs.viewport.scrollLeft;

      // this.pinXBuffer.update(scrollLeft, (value) => {
      //   var scaleX =
      //     this.tableHead.getBoundingClientRect().width /
      //     this.tableHead.offsetWidth;
      //   this.tableFirstColumn.forEach((td) => {
      //     td.style.left = `${value / scaleX}px`;
      //   });
      // });

      // const scrollTop = this.$refs.viewport.scrollTop;

      // this.pinYBuffer.update(scrollTop, (value) => {
      //   var scaleX =
      //     this.tableHead.getBoundingClientRect().width /
      //     this.tableHead.offsetWidth;
      //   this.tableHead.style.top = `${value / scaleX}px`;
      // });
    },
    typeByMintAndYear(mint, year) {
      return this.map[mint].has(year.toString());
    },
    getQuery(name) {
      if (this.plainValues.indexOf(name) != -1) return name;
      if (this.nameObjects.indexOf(name) != -1) return `${name} { name }`;

      throw new Error('Query element was not implemented: ', name);
    },
    getTypesFromMap(itemX, itemY) {
      if (this.map.has(itemX) && this.map.get(itemX).has(itemY))
        return this.map.get(itemX).get(itemY);
      return [];
    },
    updateMap() {


      if (this.types) {
        let map = new Map();
        let max = 0;

        for (let type of this.types.values()) {
          let x = this.getLabel(this.x, type);
          let y = this.getLabel(this.y, type);

          if (!map.has(x)) map.set(x, new Map());
          if (!map.get(x).has(y)) map.get(x).set(y, []);
          map.get(x).get(y).push(type);
          const length = map.get(x).get(y).length;
          if (length > max) max = length;
        }

        this.map = map
        this.mapMax = max;
      }
    },
    countColor(value) {
      if (value == 0) return '#cdcdcd';
      const rgb = Color.lerpRGB([200, 217, 102], Color.PrimaryRGB, value / this.mapMax)
      return Color.rgbToHEX(rgb);
    },
    toKey(val) {
      return val.replace(' ', '_').toLowerCase();
    },
    getCell(x, y) {
      if (this.map[x] && this.map[x][y]) return this.map[x][y].length;
      else return '';
    },

    getLabel(attr, item, vari = '') {
      if (this.plainValues.indexOf(attr) != -1) return item[attr];
      if (this.nameObjects.indexOf(attr) != -1) {
        return item[attr] && item[attr].name ? item[attr].name : 'NULL';
      }
    },
    labelsFromType: function (attr) {
      if (this.types) {
        let set = new Set();
        this.types.forEach((element) => {
          set.add(this.getLabel(attr, element, 'lot'));
        });
        return Array.from(set).sort();
      } else return [];
    },
  },
  computed: {
    mints: function () {
      return Object.keys(this.map).sort((a, b) => b < a);
    },
    sortedYears: function () {
      return Array.from(this.years).sort();
    },
    xValues: function () {
      return this.labelsFromType(this.x);
    },
    yValues: function () {
      return this.labelsFromType(this.y);
    },
    tableHead: function () {
      return this.$refs.table.querySelector('thead');
    },
    tableFirstColumn: function () {
      return this.$refs.table.querySelectorAll('td:first-of-type');
    },
  },
};
</script>

<style lang="scss" scoped>
.viewport {
  overflow-x: auto;
  position: relative;
  height: 100%;
  width: 100%;
}

table {
  position: relative;
}

.popup {
  position: absolute;
  left: 0;
  top: 0;

  min-height: 100px;
  width: 100px;

  z-index: 100;
  background-color: white;
  border: $border;
  padding: $padding;
  box-shadow: $shadow;
  border-radius: $border-radius;
  box-sizing: border-box;
}

.slider {
  margin: 10px;
}



tbody {
  overflow-y: auto;
}

.select-row {
  display: flex;
  width: 100%;

  >* {
    flex: 1;
    display: block;

    select {
      display: block;
      width: 100%;
    }
  }
}

thead {
  z-index: 1;
  position: sticky;
  top: 0;
  background-color: rgba(whitesmoke, 0.95);

  tr {
    td {
      text-align: end;
      vertical-align: bottom;
      overflow: hidden;
    }
  }
}

h1 {
  margin-bottom: 1em;
}

.color-box {
  background-color: rgb(204, 204, 204);

  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);


  &:hover {
    border-radius: 3px;
    outline: 2px solid $primary-color;
  }

  &.exists {
    background-color: green;
  }
}

.rotated {
  display: block;
  white-space: nowrap;
  padding-left: $padding;
  transform-origin: 50% 50%;
  transform: rotate(-90deg);
  transition: all 0.3s ease
}

$size: 10px;

td {

  @include interactive();
  text-align: center;
  width: $size;
  max-width: $size;
  height: 10px;
  aspect-ratio: 1 / 1;
  font-size: $small-font;
}

td:first-of-type {
  width: 50px;
  max-width: 5rem;
  max-height: $size;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
  left: 0;
  overflow: hidden;
  aspect-ratio: auto;
  text-align: left;
  background-color: rgba(whitesmoke, 0.95);
}
</style>
