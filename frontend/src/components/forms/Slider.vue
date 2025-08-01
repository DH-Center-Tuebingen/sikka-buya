<template>
  <div class="slider">
    <div class="slider-background">
      <slot name="background" />
    </div>

    <div
      class="slider-bar"
      ref="bar"
    >
      <div
        class="slider-thumb"
        v-if="interactive"
      ></div>
    </div>
    <div class="slider-foreground">
      <slot />
    </div>

    <label>
      <input
        type="range"
        ref="slider"
        :disabled="!interactive"
        :value="value"
        :min="min"
        :max="max"
        :step="step"
        :name="name"
        @wheel.prevent.stop="(event) => onWheel(event)"
        @change="(event) => onValueChange(event)"
        @input="(event) => onValueChange(event)"
        @focus="(event) => $emit('focus', event)"
        @blur="(event) => $emit('blur', event)"
      />
    </label>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      required: true,
      default: 0,
    },
    min: {
      default: 0,
    },
    max: {
      default: 100,
    },
    step: {
      default: 1,
    },
    name: String,
    interactive: {
      type: Boolean,
      default: true,
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
    focus() {
      this.$refs.slider.focus()
    },
    onValueChange(event) {
      if (this.interactive) {
        this.applyValue(event.target.value);
      }
    },
    onWheel(event){
      if(this.interactive) {
        const modifier = event.ctrlKey ? 100 : event.shiftKey ? 10 : 1;
        let value = this.value - this.step * modifier * Math.sign(event.deltaY);
        this.applyValue(value)
      }
    },
    applyValue(newValue) {
      newValue = newValue > this.max ? this.max : newValue
      newValue = newValue < this.min ? this.min : newValue
      this.$emit('input', newValue);
      this.$emit('change', newValue)
    }
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
  background-color: $dark-white;
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
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
  }

  input[type='range'] {
  appearance: none;
    -webkit-appearance: none;
  }

  input[type='range']::-webkit-slider-runnable-track {
  appearance: none;
    -webkit-appearance: none;
  }

  input[type='range']::-webkit-slider-thumb {
  appearance: none;
    -webkit-appearance: none;

    height: 1px;
    width: 1px;
  }

  input[type='range']::-moz-range-thumb {
    border: none;
    background-color: transparent;
  }

  input[type='range']:focus {
    outline: none;
  }

  input[type='range']:focus::-webkit-slider-runnable-track {
    -webkit-appearance: none;
  }

  padding: 0 math.div($caretWidth, 2);

  .slider-background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .slider-foreground::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.3), inset 1px 1px 25px rgba(0, 0, 0, 0.1);
  }

  .slider-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;

    background-color: rgba(0, 0, 0, 0.05);
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