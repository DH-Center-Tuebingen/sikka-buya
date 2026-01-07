<template>
  <div class="pagination">
    <header>
      <pagination-control
        :count="pageInfo.count"
        :page="pageInfo.page"
        :total="pageInfo.total"
        :last="pageInfo.last"
        @input="(evt) => $emit('input', evt)"
      />
    </header>
    <div class="pagination-container">
      <info
v-if="pageInfo.total === 0"
:always-show="true"
>
Keine Ergebnisse gefunden
</info>
      <slot />
    </div>
  </div>
</template>

<script>
import PageInfo from '../../models/pageinfo';
import Info from '../forms/Info.vue';
import PaginationControl from './PaginationControl.vue';
export default {
  components: { PaginationControl, Info },
  props: {
    pageInfo: {
      type: Object,
      validator(prop) {
        return PageInfo.isPageInfo(prop);
      },
    },
  },
};
</script>

<style lang="scss">
.pagination {
  background-color: $light-gray;
  input,
  button {
    border: none;
    padding: 0 !important;
  }

  .list {
    margin: 0;
  }
}
</style>

<style lang="scss" scoped>
.pagination {
  border: $border;
  border-radius: 4px;
  overflow: hidden;
  background-color: $background-color;
}

header {
  padding: $small-padding;
  background-color: $light-gray;
}

.pagination-container {
  background-color: $white;
}
</style>