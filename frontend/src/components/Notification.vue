<template>
  <div
class="notice"
:class="computedType"
>
    <div class="icon">
      <InfoIcon v-if="!type" />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script>
import InfoIcon from 'vue-material-design-icons/InformationVariant.vue';
const allowedTypes = ['info'];

export default {
  components: {
    InfoIcon,
  },
  props: {
    type: { type: String },
  },
  computed: {
    computedType() {
      if (allowedTypes.indexOf(this.type) != -1) return this.type;
      return 'info';
    },
  },
};
</script>

<style lang='scss' scoped>
.notice {
  display: flex;
  background-color: $white;
  border-radius: $border-radius;
  overflow: hidden;

  > * {
    padding: $padding $padding * 2;
  }

  &.info {
    $offset: 5px;
    $spread: 5px;
    $color: color.adjust($blue, $saturation: 50%, $lightness: 15%);
    box-shadow: $offset $offset 15px $color,
      -1 * $offset -1 * $offset 15px $color, -1 * $offset $offset 15px $color,
      $offset -1 * $offset 15px $color;

    .icon {
      background-color: $blue;
    }
  }
}

.icon {
  color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>