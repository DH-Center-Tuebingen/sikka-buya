<template>
  <div class="catalog-filter-search">
    <h1>{{ $t('editor.expert_search') }}</h1>

    <div class="grid col-2">
      <aside>
        <search-field id="text-search" v-model="text" />
        <catalog-filter
          :pageInfo="pageInfo"
          @update="updateTypes"
          :overwriteFilters="overwriteFilters"
          ref="catalogFilter"
        />
      </aside>
      <pagination :pageInfo="pageInfo" @input="updatePagination">
        <List :error="error" :items="types">
          <ListItem
            v-for="item of types"
            v-bind:key="item.key"
            :id="`list-item-type-${item.id}`"
            :to="{
              name: 'EditType',
              params: { id: item.id },
              target: '_blank',
            }"
            :class="item.completed ? 'completed' : 'incomplete'"
          >
            {{ item.projectId }}
          </ListItem></List
        ></pagination
      >
    </div>
  </div>
</template>

<script>
import List from '../../layout/List.vue';
import ListItem from '../../layout/ListItem.vue';
import LabeledInputContainer from '../../LabeledInputContainer.vue';
import Pagination from '../../list/Pagination.vue';
import CatalogFilter from '../catalog/CatalogFilter.vue';
import SearchField from '../../layout/SearchField.vue';

export default {
  components: {
    CatalogFilter,
    LabeledInputContainer,
    Pagination,
    List,
    ListItem,
    SearchField,
  },
  data() {
    return {
      text: '',
      error: null,
      types: [],
      pageInfo: { count: 50, page: 0, total: 0, last: 0 },
    };
  },
  methods: {
    updatePagination(pageInfo) {
      this.pageInfo = pageInfo;
    },
    updateTypes(args) {
      const { types, pageInfo } = args;
      this.types = types;
      this.pageInfo = pageInfo;
    },
  },
  computed: {
    overwriteFilters() {
      return { plain_text: this.text };
    },
  },
};
</script>


<style lang="scss">
.catalog-filter-search {
  .pagination {
    align-self: flex-start;
  }

  .yearOfMint,
  .mint,
  .cursiveScript,
  .procedure,
  .donativ {
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
</style>