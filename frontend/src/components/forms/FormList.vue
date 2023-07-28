<template>
  <div class="list">
    <div class="wrapper">
      <Row
        class="title-row"
        :class="{ overflowX }"
      >
        <label
          v-if="title || $slots.title"
          class="title"
        >
          <slot name="title"></slot>{{ title }} {{ length !== null ? `(${length})` : '' }}
        </label>
        <button
          class="list-add-button-besides"
          type="button"
          @click.stop.prevent="addEntry"
        >
          <span> +</span>
        </button>
      </Row>
    </div>

    <p
      v-if="description || $slots.description"
      class="description"
    >
      <slot name="description" />{{ description }}
    </p>
    <div class="list-container">

      <div
        class="list-scroll"
        :class="{ overflowX }"
      >
        <slot />
      </div>
    </div>
    <button
      class="list-add-button-below"
      type="button"
      @click.stop.prevent="addEntry"
    >
      <span>+</span>
    </button>
  </div>
</template>

<script>
import Row from '../layout/Row.vue';
export default {
  components: { Row },
  props: {
    title: String,
    description: String,
    length: { type: Number, default: null },
    overflowX: { type: Boolean, default: false }
  },
  data: function () {
    return {
      isCollapsed: false,
    };
  },
  methods: {
    addEntry: function () {
      this.$emit('add');
    },
  },
};
</script>

<style lang="scss">
.list-container {
  box-sizing: border-box;

  $left: 12px;
  padding-left: $left * 2;
  position: relative;

  .list-scroll.overflowX {
    overflow-x: auto;
  }

  &.collapsed {
    display: none;
  }

  >* {
    margin-bottom: math.div($padding, 2);
  }

  &:not(:empty) {
    &::before {
      content: '';
      position: absolute;
      $size: 10px;
      width: $size;
      height: $size;
      background-color: $gray;
      left: $left;
      top: 0;
      transform: translate(-50%);
    }

    &::after {
      height: 50%;
      content: '';
      position: absolute;
      top: 0;
      border-left: 2px solid $gray;
      height: 100%;
      left: $left;
      transform: translateX(-50%);
    }
  }

  .list-item {
    position: relative;
  }

  // .list-item:after {
  //   position: absolute;

  //   content: "";
  //   border-bottom: 2px solid $gray;
  //   width: $left + 1px;
  //   left: 0;
  //   top: calc(50% - 1px);
  //   transform: translateX(-100%);
  // }
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.description {
  font-size: 0.75rem;
}

.list {
  position: relative;
  display: flex;
  flex-direction: column;
}

.list.collapsible .title-row {
  border: 1px solid gray;
  padding: 0 10px;
}

.list-container {
  width: 100%;

  &:not(:empty) {
    margin-top: $padding;
  }
}

.title {
  text-transform: capitalize;
}

button {
  max-width: 24px;
  width: 24px;
  height: 24px;
}

.title-row {
  align-items: baseline;

  >* :first-child {
    flex: 1;
  }
}
</style> 