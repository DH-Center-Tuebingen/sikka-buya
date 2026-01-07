<template>
  <div
:class="{ active: hasSelection }"
class="selection-indicator"
>
    <span
v-if="hasSelection"
class="count"
>
      {{ selected }}
    </span>
    <div
class="selection-visualizer"
:style="{ height }"
/>
  </div>
</template>

<script>
export default {
  props: {
    total: Number,
    selected: Number,
  },
  computed: {
    hasSelection() {
      return this.selected > 0;
    },
    height() {
      if (!this.hasSelection) return '0%';
      return `${((this.selected / this.total) * 100).toFixed(2)}%`;
    },
  },
};
</script>

<style lang='scss' scoped>
.selection-indicator {
  position: relative;
  background-color: $light-gray;
  align-self: stretch;
  border-right: $border;
  padding: $tiny-padding;
  font-size: $xtra-small-font;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;

  .selection-visualizer {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    background-color: $primary-color;
    z-index: 0;
  }

  .count {
    z-index: 1;
  }

  &.active {
    color: $white;
    font-weight: bold;
  }
}
</style>