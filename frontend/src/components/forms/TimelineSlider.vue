<template>
  <slider
    class="timeline-slider"
    :value="value"
    :min="min"
    :max="max"
    :step="step"
    :interactive="interactive"
    @input="(arg) => $emit('input', arg)"
    @focus="(arg) => $emit('focus', arg)"
    @blur="(arg) => $emit('blur', arg)"
    ref="slider"
  >
    <template #background>
      <slot name="background" />
    </template>

    <div
      class="long-dash"
      v-for="lable of lables"
      :key="'timeline-key-' + lable"
      :style="offsetLeftCss(lable)"
    >
      <div class="lable">
        {{ lable }}
      </div>
    </div>

    <div
      class="short-dash"
      v-for="sub in subs"
      :key="'sub-' + sub"
      :style="offsetLeftCss(sub)"
    >
      <div class="sub" v-if="showSubs">
        {{ sub }}
      </div>

    </div>

    <div class="overlay">
      <slot />
    </div>
  </slider>
</template>

<script>
import Slider from './Slider.vue';
export default {
  components: { Slider },
  props: {
    interactive: {
      type: Boolean,
      default: true,
    },
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
    labeledValue: {
      type: Number,
    },
    subdivisions: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    focus() {
      this.$refs.slider.focus();
      this.$emit('focus');
    },
    offsetLeftCss(val) {
      return {
        left: this.valueToPercentage(val),
      };
    },

    valueToPercentage(val) {
      let ratio = (val - this.min) / (this.max - this.min);
      return (ratio * 100).toFixed(2) + '%';
    },
    getSections(mod, exclude = null) {
      const sections = [];
      if (mod) {
        const start = this.min + mod - (this.min % mod);
        let validVal = start;

        while (validVal < this.max) {
          if (!exclude || validVal % exclude !== 0) sections.push(validVal);
          validVal += mod;
        }
      }
      return sections;
    },
  },
  computed: {
    lables() {
      return this.getSections(this.labeledValue);
    },
    subs() {
      return this.getSections(
        Math.round(this.labeledValue / this.subdivisions),
        this.labeledValue
      );
    },
    showSubs() {
      return this.range < 30;
    },
    range(){
      return this.max - this.min;
    }
  },
};
</script>

<style lang="scss">
.timeline-slider {
  .slider-thumb {
    width: 1px;
    background-color: $black;

    &::before {
      content: '';
      position: absolute;
      display: block;
      top: 0;
      $size: 6px;
      width: 0;
      height: 0;
      border-top: $size * 2 solid $black;
      border-right: $size solid transparent;
      border-left: $size solid transparent;
      transform: translateX(-50%);
    }
  }

  .slider-bar {
    background-color: transparent;
  }
}
</style>

<style lang="scss" scoped>
.short-dash {
  position: absolute;
  color: rgb(41, 41, 41);
  bottom: 0;
  height: 10%;
  border-left: 1px solid currentColor;

  .sub {
    position: absolute;
    bottom: 100%;
    left: 0;
    display: block;
    font-weight: bold;
    font-size: 0.6rem;
    transform: rotate(90deg)  translate(-120%, 52%);
    transform-origin: left bottom;
  }
}

.long-dash {
  position: absolute;
  color: rgb(41, 41, 41);
  bottom: 0;
  height: 50%;
  width: 10px;

  .lable {
    position: absolute;
    display: block;
    font-weight: bold;
    font-size: 0.6rem;
    transform: rotate(90deg) translate(-100%, 40%);
    transform-origin: left bottom;
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    border-left: 1px solid currentColor;
    height: 60%;
  }
}

.overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
