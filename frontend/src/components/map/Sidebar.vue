<template>
  <div
    class="side-bar"
    :class="getSideClass"
  >
    <header class="title underlined-header">
      <h3>
        <slot name="title" />{{ title }}
      </h3>
      <div class="tools">
        <slot name="tools" />
      </div>
    </header>
    <div class="body">
      <scroll-view ref="scrollview">
        <slot />
      </scroll-view>
    </div>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
import ScrollView from '../layout/ScrollView.vue';
export default {
  components: { ScrollView },
  props: {
    title: String,
    side: {
      type: String,
      default: 'left',
    },
  },
  computed: {
    getSideClass: function () {
      return this.side == 'left' ? 'side-bar-left' : 'side-bar-right';
    },
  },
  methods: {
    recalculate() {
      this.$refs.scrollview.recalculate();
    },
  },
};
</script>

<style lang="scss" scoped>
.side-bar {
  box-sizing: border-box;
  background-color: rgba($color: $white, $alpha: 0.8);

  top: 0px;
  height: 100%;
  backdrop-filter: blur(3px);
  -moz-backdrop-filter: blur(3px);

  display: flex;
  flex-direction: column;

  z-index: 1; // Allows tooltips to appear in front of the sidebar.

  // > * {
  //   padding: math.div($padding, 2) $padding;
  // }

  .body {
    flex-grow: 1;
    overflow: auto;
  }
}

.title h3 {
  margin-top: 0;
}</style>