<template>
  <div
    class="spinner"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      default: 50,
      type: Number,
    },
  },
};
</script>

<style lang="scss" scoped>
.spinner {
  position: relative;

  @mixin circle($time, $delay) {
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;

    animation: $time infinite growing;
    animation-timing-function: linear;

    animation-delay: $delay;
  }

  &:after {
    @include circle(2s, 0);
  }

  &:before {
    @include circle(2s, -1s);
  }
}

@keyframes growing {
  0% {
    transform: scale(0.1);
    z-index: 100;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
    z-index: 0;
  }
}
</style>
