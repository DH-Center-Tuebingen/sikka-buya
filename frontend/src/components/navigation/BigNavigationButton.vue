<template>
  <router-link
class="big-navication-button button"
:to="to"
>
    <div class="content">
      <slot />
    </div>

    <ArrowRight />
  </router-link>
</template>

<script>
import ArrowRight from 'vue-material-design-icons/ArrowRight.vue';

export default {
  components: {
    ArrowRight,
  },
  props: {
    to: {
      type: Object || String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.big-navication-button {
  display: flex;
  border-radius: 15px;
  padding: 2 * $padding;
  .content {
    flex: 1;
  }
}
</style>