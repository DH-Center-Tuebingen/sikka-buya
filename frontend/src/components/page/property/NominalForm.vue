<template>
  <div class="nominal-form">
    <PropertyFormWrapper
      @submit="submit"
      @cancel="cancel"
      property="nominal"
      :loading="loading"
      :title="$tc('property.nominal')"
      :error="error"
      :disabled="disabled"
    >
      <input id="nominal-id" v-model="nominal.id" type="hidden" />
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
import PropertyFormWrapper from '../PropertyFormWrapper.vue';

export default {
  components: { PropertyFormWrapper },
  name: 'NominalForm',
  created: function () {
    let id = this.$route.params.id;
    if (id != null) {
      new Query('nominal')
        .get(id, ['id', 'name'])
        .then((result) => {
          this.nominal = result.data.data.getNominal;
          this.disabled = false;
        })
        .catch((err) => {
          this.$data.error = this.$t('error.loading_element');
          console.error(err);
        })
        .finally(() => {
          this.$data.loading = false;
        });
    } else {
      this.disabled = false;
      this.$data.loading = false;
    }
  },
  methods: {
    submit: function () {
      new Query('nominal')
        .update(this.nominal)
        .then(() => {
          this.$router.push({
            name: 'Property',
            params: { property: 'nominal' },
          });
        })
        .catch((err) => {
          this.error = this.$t('error.could_not_update_element');
          console.error(err);
        });
    },
    cancel: function () {
      this.$router.push({ path: '/nominal' });
    },
  },
  data: function () {
    return {
      error: '',
      loading: true,
      nominal: { id: -1, name: '' },
      disabled: true,
    };
  },
};
</script>
