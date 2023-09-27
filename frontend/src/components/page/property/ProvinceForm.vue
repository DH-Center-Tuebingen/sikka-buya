<template>
  <div class="dynasty-form">
    <PropertyFormWrapper
      property="province"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="province-id"
        v-model="province.id"
        type="hidden"
      />
      <input
        id="province-name"
        type="text"
        v-model="province.name"
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
import propertyFormMixinFunc from '../../mixins/property-form-mixin-func';

export default {
  name: 'ProvinceForm',
  components: { PropertyFormWrapper },
  mixins: [
    propertyFormMixinFunc({ variable: "province", property: "province" })
  ],
  data: function () {
    return {
      province: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query("province").get(id)
    },
    updateProperty: async function() {
      await new Query('province').update(this.province)
    }
  }
};
</script>
