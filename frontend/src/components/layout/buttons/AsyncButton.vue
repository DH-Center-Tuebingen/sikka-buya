<template>
  <Button :class="{ pending }" @click="clicked" class="async-button">
    <div v-if="pending" class="spinner" :class="{ show: pending }">
      <loading-spinner :size="LoadingSpinnerSize.Small" />
    </div>
    <div class="text" :class="{ show: !pending }">
      <slot />
    </div>
  </Button>
</template>

<script>
import LoadingSpinner from '../../misc/LoadingSpinner.vue';
import Button from './Button.vue';

export default {
  components: { Button, LoadingSpinner },
  props: {
    pending: Boolean,
  },
  methods: {
    clicked: function () {
      if (!this.pending) {
        this.$emit('click');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.async-button {
  position: relative;
}

.async-button > * {
  opacity: 0;
  transition: opacity 0.3s;

  &.show {
    opacity: 1;
  }
}

.button > div {
  display: flex;
  justify-content: center;
  align-items: center;
}

.button.pending {
  background-color: desaturate($color: $primary-color, $amount: 15);
  box-shadow: inset 1px 2px 3px rgba($color: #000000, $alpha: 0.2);
  cursor: not-allowed;
}

.spinner {
  color: white;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
