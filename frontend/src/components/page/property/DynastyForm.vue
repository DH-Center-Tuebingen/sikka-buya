<template>
  <div class="dynasty-form">
    <PropertyFormWrapper
      property="dynasty"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
    >
      <input
        id="dynasty-id"
        v-model="dynasty.id"
        type="hidden"
      >
      <input
        id="dynasty-name"
        v-model="dynasty.name"
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
  name: 'DynastyForm',
  components: { PropertyFormWrapper },
  mixins: [
    PropertFormMixinFunc({ variable: "dynasty", property: "dynasty" }),
  ],
  data: function () {
    return {
      dynasty: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query("Dynasty").get(id)
    },
    updateProperty: async function () {
      await new Query("Dynasty").update(this.dynasty)
    },
  }
};
</script>
