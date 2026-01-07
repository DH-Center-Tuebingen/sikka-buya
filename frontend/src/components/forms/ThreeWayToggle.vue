<template>
  <div class="three-way-toggle">
    <ButtonVue
class="no"
:class="isActive(false)"
@click="select(false)"
>
      <Close />
    </ButtonVue>
    <ButtonVue
:class="isActive(null)"
@click="select(null)"
>
      <SlashForward />
    </ButtonVue>
    <ButtonVue
class="yes"
:class="isActive(true)"
@click="select(true)"
>
      <Check />
    </ButtonVue>
  </div>
</template>

<script>
import ButtonVue from '../layout/buttons/Button.vue';

import Check from 'vue-material-design-icons/Check.vue';
import Close from 'vue-material-design-icons/Close.vue';
import SlashForward from 'vue-material-design-icons/SlashForward.vue';

export default {
  components: { ButtonVue, Check, Close, SlashForward },
  props: {
    invert: Boolean,
    value: {
      validator: (val) => val === true || val === false || val == null,
      defaultValue: null,
      required: true,
    },
  },
  methods: {
    select(state) {
      state = this.invertIfNecessary(state);
      if(state === this.value) state = null;
      this.$emit('input', state);
    },
    isActive(state) {
      state = this.invertIfNecessary(state);
      return { active: state === this.value };
    },
    invertIfNecessary(state) {
      if (this.invert && state != null) state = !state;
      return state;
    },
  },
};
</script>


<style lang="scss">
.three-way-toggle {
  .material-design-icon {
    $size: 14px;
    width: $size;
    height: $size;
  }
}
</style>

<style lang="scss" scoped>
.three-way-toggle {
  display: inline-flex;

  @include input();
  padding: 0;

  .button {
    color: $gray;
    background-color: white;
    padding: 3px;
    border-radius: 0;
    border-color: transparent;
    flex: 1;
    justify-content: center;

    &.active {
      color: $white;
      background-color: $light-gray;

      &.yes {
        background-color: $green;
      }

      &.no {
        background-color: $red;
      }
    }

    &:first-child {
      border-top-left-radius: $border-radius;
      border-bottom-left-radius: $border-radius;
    }

    &:last-child {
      border-top-right-radius: $border-radius;
      border-bottom-right-radius: $border-radius;
    }
  }
}
</style>