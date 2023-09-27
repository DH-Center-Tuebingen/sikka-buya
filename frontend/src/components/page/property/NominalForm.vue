<template>
  <div class="nominal-form">
    <PropertyFormWrapper
      property="nominal"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="nominal-id"
        v-model="nominal.id"
        type="hidden"
      />
      <input
        type="text"
        v-model="nominal.name"
        id="nominal-name"
        :placeholder="$tc('attribute.name')"
        autofocus
        required
      />
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormMixinFunc from '../../mixins/property-form-mixin-func';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';

export default {
  components: { PropertyFormWrapper },
  name: 'NominalForm',
  mixins: [
    PropertyFormMixinFunc({ variable: "nominal", property: "nominal" })
  ],
  data: function () {
    return {
      nominal: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function(id) {
      return new Query('nominal').get(id)
    },
    updateProperty: async function(){
      await (new Query('nominal')).update(this.nominal)
    }
  },
};
</script>
