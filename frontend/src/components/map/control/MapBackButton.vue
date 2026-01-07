<template>
  <nav>
    <ButtonVue
      id="back-button"
      class="map-button"
      :to="{ name: 'Home' }"
    >
      <ExitToApp
        :size="IconSize.Normal"
        class="flip"
      />
      <Locale path="routes.home" />
    </ButtonVue>
  </nav>
</template>

<script>
import Locale from '../../cms/Locale.vue';
import ExitToApp from 'vue-material-design-icons/ExitToApp.vue';
import ButtonVue from '../../layout/buttons/Button.vue';

export default { components: { ExitToApp, Locale, ButtonVue } };
</script>

<style></style>