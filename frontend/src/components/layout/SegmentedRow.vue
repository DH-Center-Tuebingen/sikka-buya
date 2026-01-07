<template>
  <div class="segmented-row">
    <div
v-if="$slots.left"
class="segment left"
>
      <slot name="left" />
    </div>
    <div
v-if="$slots.center"
class="segment center"
>
      <slot name="center" />
    </div>
    <div
v-if="$slots.right"
class="segment right"
>
      <slot name="right" />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.segmented-row {
  display: flex;
  justify-content: space-between;
  > * {
    display: flex;
    flex: 1;
    text-align: center;
  }
}

.segment.center {
  justify-content: center;
}

.segment.right {
  justify-content: flex-end;
}
</style>