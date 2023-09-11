<template>
  <overview property="person" :parameters="['color']">
    <template #list-item-before="prop">
      <div class="color-indicator-container">
        <list-color-indicator :color="prop.item.color" />
      </div>
    </template>
  </overview>
</template>

<script>
import ListItemCell from '../layout/list/ListItemCell.vue';
import ListColorIndicator from '../list/ListColorIndicator.vue';
import Overview from './Overview.vue';
export default {
  components: { Overview, ListColorIndicator, ListItemCell },
};
</script>

<style lang="scss">
.color-indicator-container {
  display: flex;
  align-items: center;
  justify-content: center;

  .color-indicator {
    margin: 0 $padding;
  }
}
</style>