<template>
  <div class="honorific-form">
    <PropertyFormWrapper
      property="honorific"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
    >
      <input
        id="honorific-id"
        v-model="honorific.id"
        type="hidden"
      >
      <input
        id="honorific-name"
        v-model="honorific.name"
        type="text"
        :placeholder="$tc('attribute.name')"
        autofocus
        required
      >
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import PropertFormMixinFunc from '../../mixins/property-form-mixin-func'

export default {
  name: 'HonorificForm',
  components: { PropertyFormWrapper },
  mixins: [
    PropertFormMixinFunc({ variable: "honorific", property: "honorific" }),
  ],
  data: function () {
    return {
      honorific: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query("Honorific").get(id)
    },
    updateProperty: async function () {
      await new Query("Honorific").update(this.honorific)
    },
  },

};
</script>
