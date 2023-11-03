<template>
  <li
    class="select-list-item"
    :class="{ selected }"
  >
    <div class="row">

      <slot name="before" />
      <div
        class="checkbox"
        v-if="!noCheckbox"
      >
        <label @click.stop="checkboxClicked">
          <div
            class="box"
            :class="{ active: selected, disabled: checkboxDisabled }"
          ></div>
        </label>
      </div>
      <slot />

    </div>
    <div>
      <slot name="beneath" />
    </div>
  </li>
</template>

<script>
export default {
  props: {
    selected: Boolean,
    noCheckbox: Boolean,
    checkboxDisabled: Boolean,
  },
  methods: {
    checkboxClicked() {
      if (!this.checkboxDisabled) {
        this.$emit('checkbox-selected');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.select-list-item {



  transition: background-color 0.3s, border 0.3s;
  border-color: transparent;

  .row {
    display: flex;
    align-items: center;
    gap: $padding;
  }

  &.selected {
    background-color: rgba($color: #000000, $alpha: .1);
    border-bottom: 1px solid rgba($color: #000000, $alpha: .05);
    border-top: 1px solid rgba($color: #000000, $alpha: .05);

    &+ .select-list-item {
      border-top: 0 solid transparent;
  }
  }
}

.checkbox {
  display: flex;

  .box {
    position: relative;

    &.disabled {
      opacity: 0.5;
    }

    &::after,
    &::before {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      border-bottom: 2px solid currentColor;
      top: calc(50% - 1px);
      transform-origin: center center;
      transition: transform 0.3s;
      border-radius: 1px;
    }

    &::after {
      transform: scale(0) rotate(45deg);
    }

    &::before {
      transform: scale(0) rotate(-45deg);
    }

    &.active {
      &::after {
        transform: scale(1) rotate(45deg);
      }

      &::before {
        transform: scale(1) rotate(-45deg);
      }
    }
  }

  $size: 12px;

  label {
    display: flex;
    align-items: center;

    padding: 5px;

    .box {
      width: $size;
      height: $size;
      border: 1px solid currentColor;
      border-radius: 3px;
    }
  }
}
</style>