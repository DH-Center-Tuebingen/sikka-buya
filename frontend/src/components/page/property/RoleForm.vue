<template>
  <div class="role-form">
    <PropertyFormWrapper
      property="role"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="role-id"
        v-model="role.id"
        type="hidden"
      />
      <input
        id="role-name"
        type="text"
        v-model="role.name"
        :placeholder="$tc('attribute.name')"
        autofocus
        required
      />
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import propertyFormMixinFunc from '../../mixins/property-form-mixin-func';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';


export default {
  name: 'RoleForm',
  components: { PropertyFormWrapper },
  mixins: [propertyFormMixinFunc({ property: "role" })],
  data: function () {
    return {
      role: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query("role").get(id)
    },
    updateProperty: async function () {
      await new Query('role').update(this.role)
    }
  },
};
</script>
