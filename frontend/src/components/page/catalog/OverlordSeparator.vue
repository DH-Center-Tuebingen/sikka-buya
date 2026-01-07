<template>
  <span
class="overlord-separator"
:class="{ appended }"
>als Oberherr:</span>
</template>

<script>
export default {
  props: {
    appended: Boolean,
  },
};
</script>


<style lang="scss" scoped>
.overlord-separator {
  margin: 0 $padding;
}

.appended {
  &:before {
    content: '';
    margin-right: 0.75em;
    border-left: 1px solid currentColor;
    height: 100%;
  }
}
</style>