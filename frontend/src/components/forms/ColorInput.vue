<template>
  <div class="color-input">
    <input
type="text"
:value="hexValue"
maxlength="6"
@input="textInput"
>
    <label
      for="color"
      class="color-preview"
      :style="{ backgroundColor: fixedValue }"
    >
      <span v-if="value == null">Keine Farbe Ausgewählt</span>
      <input
id="color"
:value="fixedValue"
type="color"
@input="input"
>
    </label>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
  },
  computed: {
    hexValue() {
      return this.value ? this.value.substr(1) : '';
    },
    fixedValue() {
      return this.value
        ? `#${this.value.substr(1, 6).padEnd(6, '0')}`
        : '#eeeeee';
    },
  },
  methods: {
    input(event) {
      this.updateValue(event.currentTarget.value);
    },
    textInput(event) {
      this.updateValue(`#${event.currentTarget.value}`);
    },
    updateValue(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style lang="scss">
input[type='color'] {
  //   display: none;
  visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.color-input {
  display: flex;
  position: relative;

  input[type='text'] {
    padding-left: 2em;
  }

  &:before {
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    display: flex;
    font-weight: bold;
    color: $light-gray;
    align-items: center;
    z-index: 10;
    content: '#';
  }

  label {
    position: relative;
    display: block;
    @include input();
    border-left: none;
  }

  > * {
    flex: 1;
  }

  :first-child {
    flex: 2;
  }
}
</style>