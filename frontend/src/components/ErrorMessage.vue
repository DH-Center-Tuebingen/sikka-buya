<template>
  <div class="error-message" v-if="error">
    <AlertCircle v-if="icon" class="icon" />
    <p
      v-for="(error, idx) in errorMessages"
      :key="'error-' + idx"
      class="error"
    >
      {{ error }}
    </p>
  </div>
</template>

<script>
import AlertCircle from 'vue-material-design-icons/AlertCircle';
export default {
  components: { AlertCircle },
  props: {
    icon: {
      type: Boolean,
      default: false,
    },
    error: {
      required: true,
      type: [String, Array],
    },
  },
  computed: {
    errorMessages() {
      return Array.isArray(this.error) ? this.error : [this.error];
    },
  },
};
</script>

<style lang="scss" scoped>
.error-message {
  // display: flex;
  // align-items: center;
  // padding: $padding;
  // background-color: $red;
  // border: 1px solid $red-dark;
  // color: $white;
  // border-radius: 5px;
}

.icon {
  margin-right: $padding;
}
</style>
