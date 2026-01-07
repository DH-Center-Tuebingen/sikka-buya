<template>
  <div class="person-page page">
    <h1><Locale :path="'routes.' + $route.name" /></h1>
    <person-explorer />
  </div>
</template>

<script>
import Locale from '../../cms/Locale.vue';
import PersonExplorer from './PersonExplorer.vue';

export default {
  components: { PersonExplorer, Locale },
};
</script>

<style>
</style>