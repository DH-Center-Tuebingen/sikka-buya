<template>
  <div class="catalog-filters">
    <template v-for="input of filteredInput">

      <labeled-input-container
        v-if="input.type === 'text'"
        :key="`${input.name}-text`"
        :class="[input.name]"
        class="input-wrapper"
      >
        <template #label>
          <locale :path="input.label" />
        </template>
        <input
          type="text"
          v-model="filters[input.name]"
        />
      </labeled-input-container>

      <labeled-input-container
        v-else-if="input.type === 'number'"
        :key="`${input.name}-number`"
        :class="[input.name]"
        class="input-wrapper"
      >
        <template #label>
          <locale :path="input.label" />
        </template>
        <input
          type="number"
          v-model="filters[input.name]"
        />
      </labeled-input-container>

      <labeled-input-container
        v-else-if="input.type === 'button-group'"
        :key="`${input.name}-button-group`"
        :class="[input.name]"
        class="input-wrapper"
      >
        <template #label>
          <locale :path="input.label" />
        </template>
        <radio-button-group
          :id="input.name"
          :tlabels="input.labels"
          :options="input.options"
          :unselectable="true"
          v-model="filters[input.name]"
        />
      </labeled-input-container>

      <labeled-input-container
        v-else-if="input.type === 'three-way'"
        :key="`${input.name}-three-way`"
        :class="[input.name]"
        class="input-wrapper"
      >
        <template #label>
          <locale :path="input.label" />
        </template>
        <three-way-toggle
          v-model="filters[input.name]"
          :invert="input.invert"
        />
      </labeled-input-container>

      <labeled-input-container
        v-else-if="input.type === 'multi-select'"
        :class="[input.name]"
        :key="`${input.name}-multi-select`"
        class="multi-select-wrapper"
      >
        <template #label>
          <locale :path="input.label" />
        </template>
        <multi-data-select
          :active="filters[input.name]"
          :additionalParameters="input.additionalParameters"
          :allowModeChange="input.allowModeChange"
          :attribute="input.attribute"
          :disableRemoveButton="true"
          :displayTextCallback="input.displayTextCallback"
          :mode="filterMode[input.name]"
          :queryCommand="input.queryCommand"
          :queryBody="input.queryBody"
          :table="input.name"
          :text="input.text"
          v-model="filters[searchVariableName(input.name)]"
          @select="(el) => selectFilter(input.name, el)"
          @remove="(el, index) => removeFilter(input.name, el, index)"
          @change-mode="() => dataSelectToggled(input)"
          @dynamic-change="() => $emit('dynamic-change')"
        />
      </labeled-input-container>
      <labeled-input-container
        v-else-if="input.type === 'multi-select-2d'"
        :class="[input.name]"
        :key="`${input.name}-multi-select-2d`"
        class="multi-select-wrapper"
      >
        <template #label>
          <locale :path="input.label" />
        </template>
        <multi-data-select-2-d
          :active="filters[input.name]"
          :input="input"
          :mode="filterMode[input.name]"
          @add="() => addToFilterList(input.name)"
          @select="(value, idx) => selectFilter(input.name, value, idx)"
          @remove="(el, idx) => removeFilter(input.name, el, idx)"
          @dynamic-change="() => $emit('dynamic-change')"
          @remove-group="(idx) => removeFilterGroup(input.name, idx)"
          @change-mode="() => dataSelectToggled(input)"
        />
      </labeled-input-container>
      <error-box
        v-else
        :key="input.name"
        :message="`${input.name} - Unbekannter Eingabetyp '${input.type}': EingabeFeld kann nicht angezeigt werden!`"
      />
    </template>
  </div>
</template>

<script>
import Query from '../../../database/query';
import { RequestGuard } from '../../../utils/Async.mjs';
import ErrorBox from '../system/ErrorBox.vue';
import Filter, { FilterList } from '../../../models/Filter';
import LabeledInputContainer from '../../LabeledInputContainer.vue';
import Locale from '../../cms/Locale.vue';
import Mode from '../../../models/Mode';
import MultiDataSelect from '../../forms/MultiDataSelect.vue';
import MultiDataSelect2D from '../../forms/MultiDataSelect2D.vue';
import PageInfo, { Pagination } from '../../../models/pageinfo';
import RadioButtonGroup from '../../forms/RadioButtonGroup.vue';
import ThreeWayToggle from '../../forms/ThreeWayToggle.vue';
import Type from '../../../utils/Type';
import { FilterType, filterConfig, filterNameMap } from '../../../config/catalog_filter';
import StringUtils from '../../../utils/StringUtils';
import URLParams from '../../../utils/URLParams';
import { snakeCase } from "change-case";
const filters = filterConfig

let filterData = {};
let filterMethods = {};



[
  ...filters[FilterType.text],
  ...filters[FilterType.threeWay],
  ...filters[FilterType.buttonGroup],
  ...filters[FilterType.number]
].forEach((item) => {
  filterData = Object.assign(filterData, {
    [item.name]: item.defaultValue == null ? null : item.defaultValue,
  });
});

let filterMode = {};

filters[FilterType.multiSelect].forEach((item) => {
  const filter = new Filter(item.name);
  filterData = Object.assign(filterData, filter.mapData(item.defaultValue));
  filterMethods = Object.assign(filterMethods, filter.mapMethods());
  filterMode[item.name] = item.mode ? item.mode : Mode.And;
  item.filter = filter;
});

filters[FilterType.multiSelect2D].forEach((item) => {
  const filter = new FilterList(item.name);
  filterData = Object.assign(filterData, filter.mapData([[]]));
  filterMethods = Object.assign(filterMethods, filter.mapMethods());
  filterMode[item.name] = item.mode ? item.mode : Mode.And;
  item.filter = filter;
});

const unorderedInputs = Object.values(filters)
  .flat()

export default {
  components: {
    MultiDataSelect,
    LabeledInputContainer,
    ThreeWayToggle,
    RadioButtonGroup,
    ErrorBox,
    MultiDataSelect2D,
    Locale,
  },
  mixins: [Mode.mixin()],
  props: {
    initData: Object,
    forceAll: Boolean,
    pageInfo: Object,
    overwriteOrder: {
      type: Object,
      default: () => ({}),
    },
    additionalQuery: {
      type: String,
    },
    typeBody: {
      type: String,
      defaultValue: 'id projectId',
    },
    constantFilters: Object,
    overwriteFilters: Object,
    exclude: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      i: 0,
      max: 10,
      unorderedInputs,
      filterConfig: filters,
      types: [],
      filters: {
        ...filterData,
      },
      filterMode: {
        ...filterMode,
      },
      watching: true,
    };
  },
  watch: {
    filters: {
      handler() {
        this.watch();
      },
      deep: true,
    },
    overwriteFilters: {
      handler() {
        this.watch();
      },
      deep: true,
    },
    pageInfo: {
      async handler(oldPageInfo, pageInfo) {
        if (!PageInfo.equals(oldPageInfo, pageInfo)) {
          await this.search(pageInfo);
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.searchRequestGuard = new RequestGuard(this.searchCallback.bind(this),
      {
        before: () => {
          this.$emit('update', { types: [], pageInfo: this.pageInfo });
        },
      }
    );
    if (this.initData) {
      const reload = []

      const initFilterMode = {};
      filters[FilterType.multiSelect].forEach((input) => {
        if (this.initData[input.name]) {
          // When the mode is not allowed to be changed, the mode is set to the default value
          input.mode = input.allowModeChange ? this.initData[input.name].mode || input.mode : input.mode;
          initFilterMode[input.name] = input.mode;
          this.initData[input.name] = this.initData[input.name].value || [];

          this.initData[input.name].forEach((item) => {
            if (item.id !== undefined && item.name.startsWith("...")) {
              reload.push({ id: item.id, category: input.name, type: FilterType.multiSelect })
            }
          })
        }
      });

      filters[FilterType.multiSelect2D].forEach((input) => {
        if (this.initData[input.name]) {
          input.mode = this.initData[input.name].mode || input.mode;
          initFilterMode[input.name] = input.mode;
          this.initData[input.name] = this.initData[input.name].value || [[]];

          this.initData[input.name].forEach((arr, arrayIndex) => {
            arr.forEach(item => {
              if (item.id !== undefined && item.name.startsWith("...")) {
                reload.push({ id: item.id, category: input.name, type: FilterType.multiSelect2D, arrayIndex })
              }
            })
          })
        }
      });

      this.filterMode = Object.assign({}, this.filterMode, initFilterMode);
      this.filters = Object.assign({}, this.filters, this.initData);
      this.reloadFilterNamesIfNecessary(reload)
    }
  },
  methods: {
    ...filterMethods,
    setFilter(key, val) {
      this.filters[key] = val;
    },
    dataSelectToggled(input) {
      this.filterMode[input.name] = Mode.toggle(this.filterMode[input.name]);
      this.search();
    },
    getURLParams() {
      let options = {};
      const configMap = filterNameMap;
      for (const [key, value] of Object.entries(this.activeFilters)) {
        const uriKey = snakeCase(key)

        if (configMap[key].type === FilterType.multiSelect) {
          options[uriKey] = URLParams.toMultiSelect(value, this.filterMode[key])
        } else if (configMap[key].type === FilterType.multiSelect2D) {
          options[uriKey] = URLParams.toMultiSelect2D(value, this.filterMode[key])
        } else {
          options[uriKey] = value;
        }
      }
      return options;
    },
    async searchCallback(filters) {
      this.$emit('loading', true);

      let types = [],
        pageInfo = this.pageInfo;

      try {
        if (this.forceAll) {
          while (
            pageInfo.total === undefined ||
            pageInfo.page * (pageInfo.count + 1) < pageInfo.total
          ) {
            let { types: nextTypes, pageInfo: nextPageInfo } =
              await Type.filteredQuery(
                {
                  pagination: Pagination.fromPageInfo(pageInfo),
                  filters,
                  typeBody: this.typeBody,
                }
              );

            pageInfo = nextPageInfo;
            pageInfo.page++;
            types.push(...nextTypes);
          }
        } else {
          ({ types, pageInfo } = await Type.filteredQuery(
            {
              pagination: Pagination.fromPageInfo(this.pageInfo),
              filters,
              typeBody: this.typeBody,
            },
            true
          ));
        }
      } catch (e) {
        this.$emit("update", { types: [], pageInfo });
        this.$emit("error", e)
        this.$emit('loading', false);
      }

      this.$emit('update', { types, pageInfo });
      this.$emit('loading', false);
    },
    reloadFilterNamesIfNecessary(reload = []) {
      if (reload.length > 0)
        Query.raw(
          // All queries get concatenated into one query  
          `{
        ${reload.map(({ id, category }) => {

            let queryName = StringUtils.capitalize(category)
            let queryBody = "{id name}"

            if (category === "otherPerson") {
              queryName = "Person"
              queryBody = "{id name:shortName}"

            }

            // We need to use an alias here to avoid conflicts with the other filters
            return `${category}_${id}:get${queryName} (id: ${id}) ${queryBody}`
          })}
      }`, {}, true).then(
            (result) => {
              const obj = result.data.data

              const filterObjs = reload.reduce((acc, { id, category, type, arrayIndex } = {}) => {


                const item = obj[`${category}_${id}`]
                item.id = parseInt(item.id)
                if (!acc[category]) acc[category] = []
                item.idx = acc[category].length

                switch (type) {
                  case FilterType.multiSelect: {
                    acc[category].push(item)
                    break;
                  }
                  case FilterType.multiSelect2D: {
                    while (acc[category].length <= arrayIndex) {
                      acc[category].push([])
                    }
                    acc[category][arrayIndex].push(item)
                    break;
                  }
                  default:
                    throw new Error(`Type not implemented for reloading names ${type}`)
                }
                return acc
              }, {})


              for (let [category, filterObj] of Object.entries(filterObjs)) {
                this.$set(this.filters, category, filterObj)
              }
            }
          )
    },
    getFilters() {

      const filters = Object.assign(
        {},
        this.activeFilters,
        this.constantFilters,
        this.overwriteFilters,
      );

      this.multiSelectFilters.forEach(({ name }) => {
        if (filters[name]) {
          if(this.filterMode?.[name].toLowerCase() === 'and') {
            filters[name + '_and'] = filters[name].map((el) => el.id);
            delete filters[name];
          } else {
            filters[name] = filters[name].map((el) => el.id);
          }
        }
      });
      console.log(filters.material)

      this.multiSelectFilters2D.forEach(({ name }) => {
        if (filters[name]) {
          if (this.filterMode?.[name].toLowerCase() === 'and') {
            filters[name + '_or_and'] = filters[name].map((arr) =>
              arr.map((el) => el.id)
            );
          } else {
            filters[name + '_and_or'] = filters[name].map((arr) =>
              arr.map((el) => el.id)
            );
          }

          delete filters[name];
        }
      });


      return filters;
    },
    async search() {

      await this.searchRequestGuard.exec(this.getFilters());
    },
    watch() {
      if (this.watching) this.search();
    },
    resetFilters() {
      [
        ...filters[FilterType.text],
        ...filters[FilterType.threeWay],
        ...filters[FilterType.buttonGroup],
        ...filters[FilterType.number],
      ].forEach((item) => {
        this.$set(this.filters, item.name, item.defaultValue || null);
      });

      [...filters[FilterType.multiSelect]].forEach((filter) => {
        const emptyObj = Filter.mapData(filter.name, filter.defaultValue);
        for (let [key, val] of Object.entries(emptyObj)) {
          this.$set(this.filters, key, val);
          const mode = filter?.mode || Mode.And
          this.$set(this.filterMode, key, mode);
        }
      });

      [...filters[FilterType.multiSelect2D]].forEach((filter) => {
        const emptyObj = FilterList.mapData(filter.name, filter.defaultValue);
        for (let [key, val] of Object.entries(emptyObj)) {
          this.$set(this.filters, key, val);
          this.$set(this.filterMode, key, filter?.mode || Mode.And);
        }
      });

      this.search();
    },
    setFilters(options) {
      [
        ...filters[FilterType.text],
        ...filters[FilterType.threeWay],
        ...filters[FilterType.buttonGroup],
        ...filters[FilterType.number],
      ].forEach((item) => {
        if (options[item.name] !== undefined) {
          this.$set(this.filters, item.name, options[item.name]);
        }
      });

      [...filters[FilterType.multiSelect], ...filters[FilterType.multiSelect2D]].forEach((filter) => {
        if (options[filter.name] !== undefined) {
          this.$set(this.filters, filter.name, options[filter.name].value);
          this.$set(this.filterMode, filter.name, options[filter.name].mode);
        }
      });

      this.search();
    },
    _getMethodFromFilter(methodName, inputName, idx = null) {
      const filterClass = idx == null ? Filter : FilterList;
      return filterClass[methodName](inputName);
    },
    selectFilter(name, target, idx = null) {
      const methodName = this._getMethodFromFilter(
        'selectMethodName',
        name,
        idx
      );
      return this[methodName](target, idx);
    },
    removeFilter(name, target, index) {
      console.log(name, target, index)
      const methodName = this._getMethodFromFilter(
        'removeMethodName',
        name,
        index
      );
      return this[methodName](target, index);
    },
    removeFilterGroup(name, idx) {
      this.filters[name].splice(idx, 1);
    },
    addToFilterList(name) {
      const methodName = FilterList.pushMethodName(name);
      return this[methodName]();
    },
    searchVariableName(value) {
      return Filter.searchVariableName(value);
    },
    stopWatching() {
      if (this.watching === false)
        console.warn("You try to stop, but it's already stopped");
      this.watching = false;
    },
    resumeWatching() {
      if (this.watching === true)
        console.warn('You try to resume, but its not stopped');

      this.watching = true;
    },
    excludeItem(group) {
      return group.filter((item) => this.exclude.indexOf(item.name) === -1);
    },
    getStorage() {
      let storage = {};
      let activeFilters = this.activeFilters;

      [
        ...filters[FilterType.text],
        ...filters[FilterType.threeWay],
        ...filters[FilterType.buttonGroup],
        ...filters[FilterType.number],
      ].forEach(({ name }) => {
        if (name === "nominal") console.log("0")
        if (activeFilters[name] != null) {
          storage[name] = activeFilters[name];
        }
      });


      filters[FilterType.multiSelect].forEach(
        (filter) => {
          if (name === "nominal") console.log("1")
          storage[filter.name] = {
            mode: this.filterMode[filter.name] || Mode.And,
            value: activeFilters[filter.name] || [],
          };
        }
      );


      filters[FilterType.multiSelect2D].forEach(
        (filter) => {
          if (name === "nominal") console.log("2")
          storage[filter.name] = {
            mode: this.filterMode[filter.name] || Mode.And,
            value: activeFilters[filter.name] || [[]],
          };
        }
      );

      return storage;
    },
  },
  computed: {
    activeFilters() {
      return Object.entries(this.filters)
        .filter(([name, val]) => {
          if (name.startsWith(Filter.searchPrefix)) return false;

          if (val === null) return false;
          if (typeof val === 'object') {
            if (Array.isArray(val)) {
              if (val.length == 0) return false;
              else if (
                val.every((el) => Array.isArray(el) && el.length === 0)
              ) {
                return false;
              }
            } else {
              return val.id && val.id !== null;
            }
          } else {
            switch (typeof val) {
              case 'string':
                return val != '';
            }
          }

          return true;
        })
        .reduce((obj, [name, val]) => {
          obj[name] = val;
          return obj;
        }, {});
    },
    inputs() {
      return this.unorderedInputs.slice().sort((a, b) => {
        let A = this.overwriteOrder[a.name] ? this.overwriteOrder[a.name] : a.order;
        let B = this.overwriteOrder[b.name] ? this.overwriteOrder[b.name] : b.order;
        if (A == null) return 1;
        else if (B == null) return -1;
        else return A - B;
      });
    },
    filtersActive() {
      return Object.keys(this.activeFilters).length > 0;
    },
    filteredInput() {
      return this.inputs.filter(
        (item) => this.exclude.indexOf(item.name) === -1
      );
    },
    multiSelectFilters() {
      return this.excludeItem(filters[FilterType.multiSelect]);
    },
    multiSelectFilters2D() {
      return this.excludeItem(filters[FilterType.multiSelect2D]);
    },
    storageString() {
      return JSON.stringify(this.getStorage());
    },
  },
};
</script>

<style lang="scss">
.catalog-filters {
  .three-way-toggle {
    min-height: 22px;
  }
}
</style>

<style lang="scss" scoped>
.catalog-filters {
  display: grid;
  gap: $padding;
  grid-template-columns: repeat(6, 1fr);
}

.input-wrapper {
  grid-column: span 3;
}

.multi-select-wrapper {
  grid-column: span 6;
}
</style>