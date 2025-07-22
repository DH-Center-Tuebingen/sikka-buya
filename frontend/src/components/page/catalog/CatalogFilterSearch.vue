<template>
  <div class="catalog-filter-search">
    <h1>
      <Locale :path="'routes.' + $route.name" />
    </h1>
    <div class="grid col-2">
      <aside>
        <search-field
          id="text-search"
          v-model="text"
        />
        <catalog-filter
          :filterConfig="filterConfig"
          :pageInfo="pageInfo"
          :initData="catalog_filter_mixin_initData"
          :overwriteOrder="filterOrder"
          @update="updateTypes"
          :overwriteFilters="overwriteFilters"
          :constantFilters="{ excludeFromTypeCatalogue: false }"
          ref="catalogFilter"
        />
      </aside>

      <div class="right-controls">
        <FilterControl
          :activeFilters="activeFilters"
          @resetFilter="resetFilter"
          @resetAllFilters="resetAllFilters"
        />

        <pagination
          :pageInfo="pageInfo"
          @input="updatePagination"
        >
          <List
            :error="error"
            :items="types"
          >
            <ListItem
              v-for="item of types"
              v-bind:key="item.key"
              :id="`list-item-type-${item.id}`"
              :to="{
                name: 'Catalog Entry',
                params: { id: item.id },
              }"
              :class="item.completed ? 'completed' : 'incomplete'"
            >
              {{ item.projectId }}
            </ListItem>
          </List>
        </pagination>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '../../layout/buttons/Button.vue';
import List from '../../layout/List.vue';
import ListItem from '../../layout/ListItem.vue';
import LabeledInputContainer from '../../LabeledInputContainer.vue';
import Pagination from '../../list/Pagination.vue';
import CatalogFilter from './CatalogFilter.vue';
import SearchField from '../../layout/SearchField.vue';
import catalogFilterMixin from '../../mixins/catalog-filter';
import Locale from '../../cms/Locale.vue';
import FilterControl from '../../interactive/search/filters/FilterControl.vue';
import { useFilterConfig } from '../../../config/catalog_filter';

export default {
  components: {
    Button,
    CatalogFilter,
    FilterControl,
    LabeledInputContainer,
    List,
    ListItem,
    Locale,
    Pagination,
    SearchField,
  },
  data() {
    return {
      text: '',
      error: null,
      types: [],
      pageInfo: { count: 50, page: 0, total: 0, last: 0 },
      filterConfig: useFilterConfig(),
    };
  },
  mixins: [catalogFilterMixin('sikka-buya-catalog-filter-search')],
  methods: {
    catalog_filter_mixin_loaded(data, filterMode) {
      if (data.text) {
        this.text = data.text;
        delete data.text;
      }
    },
    updatePagination(pageInfo) {
      this.pageInfo = pageInfo;
    },
    updateTypes(args) {
      const { types, pageInfo } = args;
      this.types = types;
      this.pageInfo = pageInfo;
      this.catalog_filter_mixin_updateActive(this.$refs.catalogFilter);
      this.catalog_filter_mixin_save(this.$refs.catalogFilter, {
        text: this.text,
      });
    },
    resetAllFilters() {
      this.text = '';
      this.$refs.catalogFilter.resetFilters();
    },
    resetFilter(name) {
      if (name == "plain_text") {
        this.text = '';
      } else this.$refs.catalogFilter.resetFilter(name);
    }
  },
  computed: {
    filterOrder() {
      return {
        otherPerson: 4.13,
        coinVerse: 5.01,
        cursiveScript: 8.1
      }
    },
    activeFilters() {
      const activeFilters = this.catalog_filter_mixin_activeFilters

      if (this.text !== '') {
        const textFilterIndex = activeFilters.findIndex(f => f.key === "plain_text")
        const filter = { key: "plain_text", value: this.text }
        if (textFilterIndex === -1) {
          activeFilters.push(filter);
        } else{
          activeFilters[textFilterIndex] = filter;
        }
      }

      return activeFilters;
    },
    overwriteFilters() {
      return this.text == "" ? {} : { plain_text: this.text };
    },
  },
};
</script>


<style lang="scss">
.catalog-filter-search {

  margin-bottom: $page-bottom-spacing;


  .yearOfMint,
  .mint,
  .cursiveScript,
  .procedure,
  .donativ,
  .small {
    grid-column: span 6;
  }
}
</style>

<style lang="scss" scoped>
#text-search {
  margin-bottom: 3 * $padding;
}

p {
  max-width: 512px;
}

.col-2 {
  grid-template-columns: 1fr 2fr;
  gap: $big-padding * 5;
}

aside {
  display: flex;
  flex-direction: column;
}


.right-controls {
  display: flex;
  flex-direction: column;
  gap: .5em;
}
</style>