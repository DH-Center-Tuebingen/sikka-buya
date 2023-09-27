<template>
  <div
    class="checkbox"
    :id="id"
  >
    <input
      type="checkbox"
      :name="id"
      :id="'checkbox-' + id"
      :checked="value"
      @input="input"
    />

    <span class="label">
      <slot name="label" />
      {{ label }} (?)
    </span>
    <label
      :for="'checkbox-' + id"
      v-if="label"
    >
      <div class="check">
        <CheckboxMarked v-if="value" />
        <CheckboxBlankOutline v-else />
      </div>
    </label>
  </div>
</template>

<script>
import Row from '../layout/Row.vue';
import CheckboxBlankOutline from 'vue-material-design-icons/CheckboxBlankOutline';
import CheckboxMarked from 'vue-material-design-icons/CheckboxMarked';

export default {
  name: 'Checkbox',
  components: {
    Row,
    CheckboxMarked,
    CheckboxBlankOutline,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    value: {
      type: Boolean,
    },
    label: { type: String, default: ' ' },
  },
  methods: {
    input: function (event) {
      const checked = event.target.checked;
      this.$emit('input', checked);
    },
  },
};
</script>

<style lang="scss" scoped>
// label {
//   display: inline;
// }

label,
#check {
  display: inline-block;
}

input {
  display: none;
}</style>
