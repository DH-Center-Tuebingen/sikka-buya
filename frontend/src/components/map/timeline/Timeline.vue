<template>
  <div
    class="timeline"
    :class="{ focussed, readonly: !interactive }"
    ref="element"
  >

    <slot name="header">
    </slot>


    <div
      class="timeline-container"
      ref="container"
    >
      <button
        v-if="interactive"
        type="button"
        @click.stop.prevent="down"
        @focus="focusTimeline"
      >
        <MenuLeft />
      </button>

      <timeline-slider
        :min="from"
        :max="to"
        :value="clampedValue"
        :labeledValue="10"
        :subdivisions="10"
        :interactive="interactive"
        :create-marks="createMarks"
        @change="change"
        @input="change"
        @focus="() => focussed = true"
        @blur="() => focussed = false"
        ref="timelineSlider"
      >
        <div class="input-wrapper">
          <input
            v-if="interactive"
            class="year-input"
            type="text"
            :value="value"
            style="text-align: center"
            @input="input"
            @blur="insertClampedValue"
          />
          <Info
            v-if="interactive"
            :alwaysShow="!valid"
            type="warning"
            class="info"
          >
            Der eingegebene Wert befindet sich außerhalb der Zeitleiste
          </Info>
        </div>

        <template #background>
          <slot name="background" />
        </template>
      </timeline-slider>
      <button
        v-if="interactive"
        type="button"
        @click.stop.prevent="up"
        @focus="focusTimeline"
      >
        <MenuRight />
      </button>
    </div>

    <footer v-if="$slots.footer">
      <slot name="footer">
      </slot>
    </footer>
  </div>
</template>

<script>
var L = require('leaflet');

import MenuLeft from 'vue-material-design-icons/MenuLeft.vue';
import MenuRight from 'vue-material-design-icons/MenuRight.vue';
import Info from '../../forms/Info.vue';
import TimelineSlider from '../../forms/TimelineSlider.vue';
import Button from '../../layout/buttons/Button.vue';
import { clamp } from '../../../utils/Math';
export default {
  components: {
    Button,
    Info,
    MenuLeft,
    MenuRight,
    TimelineSlider,
  },
  props: {
    interactive: {
      type: Boolean,
      default: true,
    },
    map: Object,
    from: Number,
    to: Number,
    value: {
      validator: (value) => {
        return !isNaN(value) || value === "";
      },
    },
    createMarks: {
      type: Boolean,
      default: true,
    },
  },
  data() { return { focussed: false } },
  computed: {
    valid() {
      return this.value >= this.from && this.value <= this.to;
    },
    clampedValue() {
      return clamp(this.value, this.from, this.to);
    },
    container() {
      return this.$refs.container
    }
  },
  methods: {
    setMapTo(options) {
      this.map.setView(options.location, options.zoom, { animation: true });
      this.changed(options.year);
    },
    input(value) {
      let newValue = parseFloat(value)
      if (isNaN(newValue)) newValue = "";

      this.$emit('input', newValue);
    },
    change(value) {
      this.changed(parseFloat(value));
    },
    changed(val, isPlaying = false) {
      this.$emit('change', val, isPlaying);
    },
    insertClampedValue() {
      this.$emit('input', this.clampedValue);
    },
    enableMap() {
      this.map.dragging.enable();
    },
    disableMap() {
      this.map.dragging.disable();
    },
    down(isPlaying = false) {
      const prev = this.value - 1;
      let exec = prev >= this.from;
      if (exec)
        this.changed(parseFloat(prev), isPlaying);

      return exec
    },
    up(isPlaying = false) {
      const next = this.value + 1;
      let exec = next >= this.from;
      if (exec)
        this.changed(parseFloat(next), isPlaying);

      return exec
    },
    init() {
      L.Control.Timeline = L.Control.extend({
        options: {
          position: 'middlecenter',
        },
        onAdd: () => {
          return this.$refs.element;
        },
      });
      let timeline = new L.Control.Timeline();
      timeline.addTo(this.map);
    },
    focusTimeline() {
      this.$refs.timelineSlider.focus()
    },
  },
};
</script>

<style lang="scss">
.timeline {
  transition: $transition-time transform;
  transform: translateY(0);

  .slider {
    border: 0;
  }
}
</style>


<style lang="scss" scoped>
.timeline-container {
  display: flex;

  >.slider {
    flex: 1;
    border-radius: 0;
  }
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;



  &.readonly {
    background-color: $white;
    border-radius: $border-radius;
    padding: $padding;
    box-sizing: border-box;
  }

  >.timeline-container {
    flex: 1;
  }

  footer {
    padding-top: .2em;
  }

  &.focussed::after {
    opacity: 1;
  }

  &::after {
    content: "";
    display: block;
    pointer-events: none;
    z-index: 1000;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    outline: 1px solid $primary-color;
    border-radius: $border-radius;
    opacity: 0;
    transition: opacity 0.3s;
  }
}

.timeline-container {
  button {
    border-radius: 0;
  }

  :first-child {
    border-top-left-radius: $border-radius;
    border-bottom-left-radius: $border-radius;
  }

  :last-child {
    border-top-right-radius: $border-radius;
    border-bottom-right-radius: $border-radius;
  }
}

.label {
  color: $light-gray;
}

.input-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  pointer-events: none;

  .info {
    width: calc(100% - #{$small-padding * 2});
    margin: 0 $small-padding;
    position: absolute;
    left: 0;
    bottom: $small-padding;
    border-radius: 3px;
    padding: $small-padding;
  }

  .year-input {
    display: block;
    padding: 5px;
    min-width: 75px;
    width: 10%;
    max-width: 100%;
    margin: auto;
    pointer-events: all;
    border: none;
    border-radius: $border-radius;

    color: $black;

    font-size: 1.2rem;
    font-weight: bold;
    background-color: rgba($color: #ffffff, $alpha: 0.5);
    margin-top: 5px;
    // border-bottom: 1px solid currentColor;

    transition: all 0.2s;


    &:active {
      background-color: white !important;
    }

    &:hover {
      filter: brightness(1);
    }

    &:focus {
      background-color: rgba($color: #ffffff, $alpha: 0.8);
      outline: 2px solid $primary-color;
    }
  }
}
</style>
