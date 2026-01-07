<template>
  <div class="selectable-list-header">
    <selection-indicator
:selected="selected"
:total="total"
/>
    <h4><slot /></h4>
    <div class="fill" />

    <list-selection-tools
      :all-selected="allSelected"
      :none-selected="noneSelected"
      :hide-select-all-button="hideSelectAllButton"
      @select-all="$emit('select-all')"
      @unselect-all="$emit('unselect-all')"
    />
  </div>
</template>

<script>
import ListSelectionTools from '../interactive/ListSelectionTools.vue';
import SelectionIndicator from './SelectionIndicator.vue';
export default {
  components: { ListSelectionTools, SelectionIndicator },
  props: {
    allSelected: Boolean,
    noneSelected: Boolean,
    selected: Number,
    total: Number,
    hideSelectAllButton: Boolean,
  },
};
</script>

<style lang='scss' scoped>
.selectable-list-header {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
}

.fill {
  flex: 1;
}
</style>