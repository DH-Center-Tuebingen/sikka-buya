<template>
  <simplebar
class="scroll"
data-simplebar-auto-hide="false"
>
    <slot />
  </simplebar>
</template>

<script>
import simplebar from 'simplebar-vue';

import 'simplebar/dist/simplebar.min.css';
export default {
  components: { simplebar },
  methods: {
    recalculate() {
      // this.$refs.simplebar.SimpleBar.recalculate();
    },
  },
};
</script>


<style lang="scss" scoped>
.scroll {
  height: 100%;
  // overflow-x: hidden;
  overflow-y: auto;
}
</style>
