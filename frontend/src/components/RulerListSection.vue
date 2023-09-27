<template>
  <ul
    class="ruler-list-section"
    v-if="Array.isArray(items) && items.length > 0"
  >
    <RulerListItem
      v-for="item of unavailable"
      :key="'ruler-' + item.id"
      :selected="isSelected(item)"
      :item="item"
      :css="styler(item)"
      :unavailable="true"
      @selection-changed="() => $emit('selection-changed', item)"
    />
    <RulerListItem
      v-for="item of items"
      :key="'ruler-' + item.id"
      :selected="isSelected(item)"
      :item="item"
      :css="styler(item)"
      @selection-changed="() => $emit('selection-changed', item)"
    />

  </ul>
</template>

<script>

import MultiSelectListMixin from './mixins/multi-select-list.js';
import RulerListItem from './RulerListItem.vue';
export default {
  props: {
    unavailable: {
      type: Array,
      validator: (items) => {
        return items.every((item) => item && item.hasOwnProperty('id'));
      },
    },
    items: {
      type: Array,
      validator: (items) => {
        return items.every((item) => item && item.hasOwnProperty('id'));
      },
    },
    selectedIds: Array,
    styler: {
      type: Function,
      default: () => { },
    },
  },
  components: {
    RulerListItem
  },
  mixins: [MultiSelectListMixin],
};
</script>

<style lang="scss">
.ruler-list {
  li {
    border: none;
    border-radius: 0;
    padding-left: 5px;
  }

  .multi-select-list .select-list-item {
    grid-template-columns: auto 30px 1fr;
  }

  // .color-indicator {
  //   $size: 1em;
  //   width: math.div($size, 3);
  //   height: $size;
  //   border-radius: $border-radius;
  //   border: 3px solid currentColor;
  //   background-color: currentColor;
  //   margin-right: 5px;
  // }
}
</style>

