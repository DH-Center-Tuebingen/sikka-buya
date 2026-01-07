<template>
  <div
    class="slide slideshow-item"
    @click.stop.prevent="() => $emit('select')"
  >
    <div
      v-if="number"
      class="number-indicator"
    >
      {{ number }}
    </div>
    <div
v-if="useSimple"
class="slide-row-grid"
>
      <SlideRow
        v-for="(row, index) in getRows()"
        :key="`slide-row-${index}`"
        :icon="row.icon"
        :text="row.text"
        :style="getGridColumns(row.columns)"
      />
    </div>
    <div
v-else
class="slide-body"
>
      {{ options.year ? options.year : "-" }}
    </div>
  </div>
</template>

<script>
import SlideRow from './SlideRow.vue';

export default {
  components: {
    SlideRow
  },
  props: {
    useSimple: Boolean,
    name: [String, Number],
    number: Number,
    options: Object,
    display: Object,
  },
  methods: {
    getRows() {
      return this.display?.rows?.length > 0 ? this.display.rows : [];
    },
    getGridColumns(columns = 4) {
      return {
        ["grid-column"]: `span ${columns}`
      }
    },
  }
};
</script>

<style lang="scss">
.slide {
  display: grid;
  grid-template-columns: auto auto;
  border: $border;
  border-radius: $border-radius;
  background-color: $white;
  @include interactive();

  &.active {
    outline: 1px solid $primary-color;

    .number-indicator {
      background-color: $primary-color;
    }
  }

  .number-indicator {
    color: $white;
    font-size: $xtra-small-font;
    font-weight: bold;
    padding: 0;
    grid-column: span 2;
    text-align: center;

    border-top-right-radius: $border-radius;
    border-top-left-radius: $border-radius;

    background-color: $gray;

    @include interactive();
  }

  min-width: 32px;
  padding: 0;

  >* {
    padding: math.div($padding, 2) $padding;
  }
}
</style>

<style lang="scss" scoped>

.slide-body {
  grid-column: span 2;
  display: flex;
  justify-content: center;
}
.slide-row-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  justify-items: center;
}
</style>