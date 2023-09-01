<template>
  <div class="coin-verse-form">
    <PropertyFormWrapper
      @submit="submit"
      @cancel="cancel"
      :loading="loading"
      :title="$tc('property.coin_verse')"
      property="coin_verse"
      overwriteRoute="CoinVerseOverview"
      :error="error"
      :disabled="disabled"
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

export default {
  components: { PropertyFormWrapper },
  name: 'CoinVerseForm',
  created() {
    let id = this.$route.params.id;
    if (id != null) {
      Query.raw(
        `{
        getCoinVerse(id: ${id}){
          id,
          name
        }
      }`
      )
        .then((result) => {
          const data = result.data.data.getCoinVerse;
          this.value = data;
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
      let query;
      if (this.value.id && this.value.id >= 0) {
        query = `mutation{
        updateCoinVerse(id: ${this.value.id}, name: "${this.value.name}")
        }`;
      } else {
        query = `mutation{
        addCoinVerse(name: "${this.value.name}")
        }`;
      }

      Query.raw(query)
        .then(() => {
          this.$router.push({
            name: 'CoinVerseOverview',
          });
        })
        .catch((err) => {
          this.error = this.$t('error.could_not_update_element');
          console.error(err);
        });
    },
    cancel: function () {
      this.$router.push({ name: 'CoinVerseOverview' });
    },
  },
  data: function () {
    return {
      error: '',
      loading: true,
      value: { id: -1, name: '' },
      disabled: true,
    };
  },
};
</script>
