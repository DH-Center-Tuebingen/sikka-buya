<template>
  <div
    class="color-indicator"
    :style="style"
  />
</template>

<script>
export default {
  props: {
    color: String,
    defaultColor: {
      type: String,
      default: '#ffffff',
    },
  },
  computed: {
    finalColor() {
      return this.color || this.defaultColor || '#ffffff';
    },
    style() {
      return `background-color: ${this.finalColor};`;
    },
  },
};
</script>

<style lang='scss' scoped>
.color-indicator {
  $size: 14px;
  width: $size;
  height: $size;
  min-width: $size;
  min-height: $size;
  border: $border;
  border-color: $gray;
  box-sizing: border-box;
  border-radius: math.div($size, 2);
}
</style>