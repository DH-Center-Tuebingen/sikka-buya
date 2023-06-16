<template>
  <div class="card-link-page">
    <header>
      <h1>
        <locale :path="title" />
      </h1>
      <CMSView
        :createText="`cms.create_text`"
        :editText="`cms.edit-text`"
        :group="`card-link-page-${sanitize(title)}-description`"
        class="description"
      />
      <div class="nav-grid grid">
        <card-link
          v-for="link of links"
          :key="`link-to-${link.title}`"
          :to="link.to"
          :identity="link.identity"
          :disabled="link.disabled"
          :contain="Boolean(link.contain)"
        >
          <locale :path="link.title" />
        </card-link>

        <CMSView
          v-for="link in links"
          :key="`description-for-${link.title}`"
          :group="`card-link-page-${sanitize(link.title)}`"
        />
      </div>
    </header>
  </div>
</template>

<script>
import CMSView from '../cms/CMSView.vue';
import Locale from '../cms/Locale.vue';
import CardLink from '../navigation/CardLink.vue';
export default {
  components: {
    CardLink,
    Locale,
    CMSView,
  },
  props: {
    title: String,
    links: Array,
  },
  methods: {
    sanitize(str) {
      return str.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }
  }
}
</script>

<style lang="scss">
.card-link-page {
  h2 {
    margin-top: 0;
  }

}
</style>

<style lang="scss" scoped>
.nav-grid {
  grid-template-columns: 1fr 1fr 1fr;
  gap: 3 * $padding;
}

.description:not(:empty){
  margin-bottom: 1em;
}
</style>
