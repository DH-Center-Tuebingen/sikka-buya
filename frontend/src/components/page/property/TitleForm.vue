<template>
  <div class="title-form">
    <PropertyFormWrapper
      property="title"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="title-id"
        v-model="title.id"
        type="hidden"
      />
      <input
        type="text"
        id="title-name"
        v-model="title.name"
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
  name: 'TitleForm',
  components: { PropertyFormWrapper },
  mixins: [propertyFormMixinFunc({ property: "title" })],
  data: function () {
    return {
      title: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query('title').get(id)
    },
    updateProperty: async function () {
      await new Query('title').update(this.title)
    }
  }
};
</script>
