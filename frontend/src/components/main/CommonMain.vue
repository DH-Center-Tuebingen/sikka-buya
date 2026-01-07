<template>
  <main>
    <navigation />
    <router-view />
    <page-footer />
  </main>
</template>

<script>
import Navigation from '../Navigation.vue';
import PageFooter from '../page/PageFooter.vue';
export default {
  name: 'CommonMain',
  components: { Navigation, PageFooter },
};
</script>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  footer {
    margin-top: auto;
  }
}
</style>

