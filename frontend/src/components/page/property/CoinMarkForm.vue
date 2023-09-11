<template>
  <div class="coin-mark-form">
    <PropertyFormWrapper
      property="coin_mark"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="coin-mark-id"
        v-model="value.id"
        type="hidden"
      />
      <input
        id="coin-mark-name"
        type="text"
        v-model="value.name"
        :placeholder="$tc('general.name')"
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
  name: 'CoinMarkForm',
  mixins: [
    PropertFormMixinFunc({ variable: "value", property: "coin_mark" }),
  ],
  data: function () {
    return {
      value: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query("CoinMark").get(id)
    },
    updateProperty: async function (value) {
      await new Query("CoinMark").update(value)
    },
  },
};
</script>
