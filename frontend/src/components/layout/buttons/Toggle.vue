<template>
  <div
    class="toggle"
    :class="classes"
    @click.stop.prevent="toggle"
  >
    <Tooltip v-if="tooltip">{{ tooltip }}</Tooltip>
    <slot
      v-if="!$slots.active && !$slots.inactive"
    ></slot>
    <template v-if="value">
      <slot name="active"></slot>
    </template>
    <template v-else>
      <slot name="inactive"></slot>
    </template>
  </div>
</template>

<script>
import Tooltip from '../../forms/Tooltip.vue';

export default {
  name: "Toggle",
  props: {
    readonly: Boolean,
    value: {
      type: Boolean,
      required: true,
    },
    tooltip: String
  },
  methods: {
    toggle: function () {
      this.$emit("input", !this.value);
    },
    stop(event) {
      event.stopPropagation();
      event.preventDefault();
    },
  },
  components: { Tooltip },
  computed: {
    classes() {
      return {
        active: this.value,
        "button": !this.readonly,
        ["toggle-button"]: !this.readonly
      };
    },
  }
};
</script>

<style lang="scss" scoped>
.toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  span {
    text-overflow: ellipsis;
  }

  &:not(.button)>.active {
    background-color: transparent;
    color: $primary-color;
  }
}

.button {

  &.active {
    color: white;
    background-color: $primary-color;
  }

  >.active {
    color: $white;
  }
}
</style>