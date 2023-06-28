<template>
  <div class="page">
    <header>
      <h2>Analytics Table</h2>

      <div class="select-row">
        <labeled-property label="X-Achse">
          <select @input="xChanged">
            <option
              v-for="(val, index) of values"
              :value="val"
              :key="index"
              :selected="val == x"
            >
              {{ val }}
            </option>
          </select>
        </labeled-property>
        <labeled-property label="Y-Achse">
          <select @input="yChanged">
            <option
              v-for="(val, index) of values"
              :value="val"
              :key="index"
              :selected="val == y"
            >
              {{ val }}
            </option>
          </select>
        </labeled-property>
        <labeled-property label="Skalierung">
          <slider
            :min="0"
            :max="1"
            :value="scale"
            @input="updateScale"
            :step="0.01"
          />
        </labeled-property>
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
        <thead>
          <tr>
            <td></td>
            <td
              v-for="(itemX, xIdx) of xValues"
              :key="'row-' + xIdx"
            >
              {{ itemX }}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(itemY, yIdx) in yValues"
            :key="'head-' + yIdx"
          >
            <td>{{ itemY }}</td>
            <td
              v-for="(itemX, xIdx) of xValues"
              v-bind:key="'cell-' + yIdx + '-' + xIdx"
              class="color-box"
              :class="{ exists: getTypesFromMap(itemX, itemY).length != 0 }"
            >
              {{ getTypesFromMap(itemX, itemY).length }}
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
export default {
  components: { Slider, LabeledProperty },
  name: 'YearMintTablePage',
  created: function () {
    this.fetchTypes();

    this.pinXBuffer = new RequestBuffer(25, { allowSame: true });
    this.pinYBuffer = new RequestBuffer(25, { allowSame: true });
  },
  data: function () {
    return {
      x: 'mint',
      y: 'yearOfMint',
      values: ['yearOfMint', 'mint', 'material', 'nominal'],
      types: null,
      error: '',
      map: new Map(),
      plainValues: ['yearOfMint'],
      nameObjects: ['mint', 'material', 'nominal'],
      scale: 1,
      pinXBuffer: null,
      pinYBuffer: null,
    };
  },
  methods: {
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

        this.types = types;
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
      const scrollLeft = this.$refs.viewport.scrollLeft;

      this.pinXBuffer.update(scrollLeft, (value) => {
        var scaleX =
          this.tableHead.getBoundingClientRect().width /
          this.tableHead.offsetWidth;
        this.tableFirstColumn.forEach((td) => {
          td.style.left = `${value / scaleX}px`;
        });
      });

      const scrollTop = this.$refs.viewport.scrollTop;

      this.pinYBuffer.update(scrollTop, (value) => {
        var scaleX =
          this.tableHead.getBoundingClientRect().width /
          this.tableHead.offsetWidth;
        this.tableHead.style.top = `${value / scaleX}px`;
      });
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
        this.map = new Map();
        for (let type of this.types.values()) {
          let x = this.getLabel(this.x, type);
          let y = this.getLabel(this.y, type);

          if (!this.map.has(x)) this.map.set(x, new Map());
          if (!this.map.get(x).has(y)) this.map.get(x).set(y, []);
          this.map.get(x).get(y).push(type);
        }
      }
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
.slider {
  margin: 10px;
}

.page {
  max-height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  // font-size: 10px;
}

.viewport {
  overflow: scroll;
  background-color: white;
  flex: 1 0 0;
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
  position: relative;
  top: 0;
  background-color: rgba(whitesmoke, 0.95);
}

h1 {
  margin-bottom: 1em;
}

.color-box {
  width: 20px;
  height: 20px;
  background-color: rgb(204, 204, 204);

  font-weight: bold;
  text-transform: uppercase;
  color: white;

  &.exists {
    background-color: green;
  }
}

td {
  text-align: center;
  width: 50px;
  min-width: 50px;
  height: 30px;
}

td:first-of-type {
  position: relative;
  left: 0;
  background-color: rgba(whitesmoke, 0.95);
}</style>
