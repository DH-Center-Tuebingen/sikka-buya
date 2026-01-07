<template>
  <div class="material-form">
    <PropertyFormWrapper
      property="material"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
      :overwrite-route="overwriteRoute"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
    >
      <input
        id="material-id"
        v-model="material.id"
        type="hidden"
      >
      <input
        id="material-name"
        v-model="material.name"
        type="text"
        :placeholder="$tc('attribute.name')"
        autofocus
        required
      >

      <ColorInput
        v-if="material.id >= 0"
        id="material-color"
        v-model="material.color"
      />
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import ColorInput from '../../forms/ColorInput.vue';
import propertyFormMixinFunc from '../../mixins/property-form-mixin-func';

export default {
  components: { PropertyFormWrapper, ColorInput },
  mixins: [
    propertyFormMixinFunc({ variable: "material", property: "material" }),
  ],
  data: function () {
    return {
      material: { id: -1, name: '', color: null },
    };
  },
  computed: {
    overwriteRoute() {
      return { name: "MaterialOverview" }
    }
  },
  methods: {
    getProperty: async function (id) {
      return new Query("Material").get(id, ['id', 'name', 'color'])
    },
    updateProperty: async function () {
      await new Query("Material").update(this.material)
    },
  }
};
</script>
