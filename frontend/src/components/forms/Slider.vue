<template>
  <div class="slider">
    <div class="slider-background"><slot name="background" /></div>

    <div class="slider-bar" ref="bar">
      <div class="slider-thumb"></div>
    </div>
    <div class="slider-foreground"><slot /></div>

    <label>
      <input
        type="range"
        ref="slider"
        :value="value"
        :min="min"
        :max="max"
        :step="step"
        @change="(event) => $emit('change', event)"
        @input="(event) => $emit('input', event)"
      />
    </label>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
  },
  watch: {
    value() {
      this.$refs.bar.style.width = (this.ratio * 100).toFixed(6) + '%';
    },
  },
  mounted() {
    this.$refs.bar.style.width = (this.ratio * 100).toFixed(6) + '%';
  },
  methods: {
    updateValue(event) {
      const { x: sliderX, width } = event.currentTarget.getBoundingClientRect();
      let { x } = event;

      let clickPosition = x - sliderX;
      const ratio = clickPosition / width;
      let value = ratio * this.range;
      const rest = value % this.step;
      if (rest !== 0) {
        if (rest < this.step / 2) {
          value -= rest;
        } else {
          value += this.step - rest;
        }
      }
      event.value = value;

      this.$emit('change', event);
    },
  },
  computed: {
    ratio() {
      return (this.value - this.min) / this.range;
    },
    range() {
      return this.max - this.min;
    },
    clampedValue() {
      return Math.max(Math.min(this.max, this.value), this.min);
    },
  },
};
</script>

<style lang="scss">
$caretWidth: 5px;
.slider {
  position: relative;
  background-color: white;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  min-height: 10px;
  min-width: 100px;

  border-radius: 5px;

  label {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  input[type='range'] {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.5;
    margin: 0;
    padding: 0;
    border: 0;
  }

  input[type='range'] {
    -webkit-appearance: none;
  }

  input[type='range']::-webkit-slider-runnable-track {
    -webkit-appearance: none;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;

    height: 1px;
    width: 1px;
  }

  input[type='range']::-moz-range-thumb {
    border: none;
  }

  input[type='range']:focus {
    outline: none;
  }

  input[type='range']:focus::-webkit-slider-runnable-track {
    -webkit-appearance: none;
  }

  padding: 0 $caretWidth/2;

  .slider-background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.3);
  }

  .slider-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;

    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: none;
    z-index: 1;
  }

  .slider-thumb {
    width: $caretWidth;
    height: 100%;
    background-color: #48ac48;
    right: 0;
    position: absolute;
    transform: translateX(50%);
  }
}
</style>