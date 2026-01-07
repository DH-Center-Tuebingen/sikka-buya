<template>
  <div class="wrapper">
    <div class="stage">
      <timeline-slider
        :value="value"
        :min="min"
        :max="max"
        :labeled-value="10"
        :subdivisions="2"
        @input="input"
      />
    </div>
  </div>
</template>

<script>
import TimelineSlider from '../forms/TimelineSlider.vue';
export default {
  components: { TimelineSlider },
  data() {
    return {
      value: 321,
      min: 296,
      max: 555,
    };
  },
  methods: {
    input(args) {
      this.value = parseInt(args.currentTarget.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: absolute;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider {
  min-height: 200px;
  min-width: 500px;
}
</style>