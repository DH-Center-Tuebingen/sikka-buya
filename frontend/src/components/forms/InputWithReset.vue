<template>
  <div class="input-with-reset">
    <input
      :type="type"
      :value="value"
      @input="(event) => $emit('input', event.target.value)"
    >
    <button @click="() => $emit('reset')">
      <RevertIcon
        v-if="icon === 'revert'"
        :size="iconSize"
      />
      <CloseIcon
        v-else
        :size="iconSize"
      />
    </button>
  </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import RevertIcon from 'vue-material-design-icons/Undo';
export default {
  components: { CloseIcon, RevertIcon },
  props: {
    value: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'text',
    },
    icon: {
      type: String,
      validator: (value) => ['close', 'revert'].includes(value),
    }
  },
  computed: {
    iconSize() {
      return 16;
    },
  },
};
</script>

<style lang='scss' scoped>
.input-with-reset {
  position: relative;
  display: flex;
  align-items: stretch;

  input {
    flex: 1;
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }


}</style>