<template>
  <div
    class="toggle"
    :class="classes"
    @click.stop.prevent="toggle"
  >
    <Tooltip v-if="tooltip">
aaaa {{ tooltip }}
</Tooltip>
    <slot v-if="!$slots.active && !$slots.inactive" />
    <template v-if="value">
      <slot name="active" />
    </template>
    <template v-else>
      <slot name="inactive" />
    </template>
  </div>
</template>

<script>
import Tooltip from '../../forms/Tooltip.vue';

export default {
  name: "Toggle",
  components: { Tooltip },
  props: {
    readonly: Boolean,
    value: {
      type: Boolean,
      required: true,
    },
    tooltip: String
  },
  computed: {
    classes() {
      return {
        active: this.value,
        "button": !this.readonly,
        ["toggle-button"]: !this.readonly
      };
    },
  },
  methods: {
    toggle: function () {
      this.$emit("input", !this.value);
    },
    stop(event) {
      event.stopPropagation();
      event.preventDefault();
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