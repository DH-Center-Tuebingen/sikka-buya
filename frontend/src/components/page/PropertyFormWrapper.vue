<template>
  <div class="property-page">
    <h1>
      <Locale :path="`property.${property}`" />
    </h1>
    <LoadingSpinner
      class="loading-spinner"
      v-show="loading"
    />
    <form
      v-show="!loading"
      @submit.prevent.stop="() => log('PREVENTED SUBMIT')"
    >
      <slot></slot>
      <div
        v-if="error"
        class="information error"
      >
        <template v-if="Array.isArray(error)">
          <p v-for="[idx, err] of error.entries()" :key="'error-' + idx">{{ err }}</p>
        </template>
        <span v-else>
          {{ error }}
        </span>
      </div>
      <Row class="button-bar">
        <Button
          id="cancel-button"
          type="button"
          @click="cancel"
        >
          <Locale path="form.cancel" />
        </Button>
        <Button
          id="submit-button"
          type="submit"
          @click="submit"
          :disabled="disabled || !dirty"
        >
          <Locale path="form.submit" />
        </Button>
      </Row>
    </form>
  </div>
</template>

<script>
import Locale from '../cms/Locale.vue';
import Row from '../layout/Row.vue';
import Button from '../layout/buttons/Button.vue';
import LoadingSpinner from '../misc/LoadingSpinner.vue';

export default {
  name: 'PropertyFormWrapper',
  props: {
    dirty: {
      type: Boolean,
      required: true,
    },
    property: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    overwriteRoute: Object,
    loading: Boolean,
    error: {
      type: [String, Array],
      default: null,

    },
  },
  components: {
    LoadingSpinner,
    Row,
    Locale,
    Button
  },
  methods: {
    submit: function () {
      this.$emit('submit');
    },
    // TODO: This should just emit the cancel event, it can be customly handled in the form-mixin.
    cancel: function () {
      if (this.overwriteRoute) {
        this.$router.push(this.overwriteRoute);
      } else {
        console.log('PropertyFormWrapper: Canceling', this.property)
        this.$router.push({
          name: 'Property',
          params: { property: this.property },
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;

  >* {
    margin-bottom: $padding;
  }
}
</style>
