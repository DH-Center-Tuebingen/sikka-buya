<template>
  <div class="honorific-form">
    <PropertyFormWrapper
      property="honorific"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="honorific-id"
        v-model="honorific.id"
        type="hidden"
      />
      <input
        id="honorific-name"
        type="text"
        v-model="honorific.name"
        :placeholder="$tc('attribute.name')"
        autofocus
        required
      />
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import PropertFormMixinFunc from '../../mixins/property-form-mixin-func'

export default {
  components: { PropertyFormWrapper },
  name: 'HonorificForm',
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
