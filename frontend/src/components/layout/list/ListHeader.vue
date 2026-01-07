<template>
  <list-item class="list-item-header disable-input">
    <h4><slot /></h4>
</list-item>
</template>

<script>
import ListItem from '../ListItem.vue';
export default {
  components: { ListItem },
};
</script>

<style lang="scss">
.list-item-header {
  .list-item-row {
    background-color: transparent;
  }
}
</style>
<style lang='scss' scoped>
h4 {
  margin: 0;
}

.list-item-header {
  user-select: none;
  @include input();

  .list-item-row {
    background-color: transparent;
  }

  background-color: $gray;
  color: $white;
  border-bottom: none !important;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>