<template>
  <div class="epoch-form">
    <PropertyFormWrapper
      property="epoch"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
    >
      <input
        id="epoch-id"
        v-model="value.id"
        type="hidden"
      >
      <input
        id="epoch-name"
        v-model="value.name"
        type="text"
        :placeholder="$tc('general.name')"
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
  name: 'EpochForm',
  components: { PropertyFormWrapper },
  mixins: [
    PropertFormMixinFunc({ variable: "value", property: "epoch" }),
  ],
  data: function () {
    return {
      value: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query("Epoch").get(id)
    },
    updateProperty: async function (value) {
      await new Query("Epoch").update(value)
    },
  },
};
</script>
