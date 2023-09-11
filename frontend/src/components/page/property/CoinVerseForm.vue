<template>
  <div class="coin-verse-form">
    <PropertyFormWrapper
      property="coin_verse"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="coin-verse-id"
        v-model="value.id"
        type="hidden"
      />
      <input
        id="coin-verse-name"
        type="text"
        v-model="value.name"
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
  name: 'CoinVerseForm',
  mixins: [
    PropertFormMixinFunc({ variable: "value", property: "coin_verse" }),
  ],
  data: function () {
    return {
      value: { id: -1, name: '' },
    };
  },
  methods: {
    getProperty: async function (id) {
      return new Query("CoinVerse").get(id)
    },
    updateProperty: async function () {
      await new Query("CoinVerse").update(this.value)
    },
  },
};
</script>
