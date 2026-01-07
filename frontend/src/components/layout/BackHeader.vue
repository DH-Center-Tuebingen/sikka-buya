<template>
  <div class="back-header">
    <router-link :to="to">
<ArrowLeft /><Locale path="navigation.back" />
</router-link>
  </div>
</template>

<script>
import ArrowLeft from 'vue-material-design-icons/KeyboardBackspace';
import Locale from '../cms/Locale.vue';
export default {
  name: 'ValueWrapper',
  components: {
    ArrowLeft,
    Locale
  },
  props: {
    to: {
      type: Object,
      required: true,
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.back-header {
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
}

h1 {
  margin: 0;
}

a {
  @include resetLinkStyle();

  display: flex;
  align-items: center;
  color: black;
  text-transform: capitalize;
  align-self: flex-start;
  padding: $padding;
  margin-top: $padding;

  background-color: $white;
  margin-left: -40px;
  padding-left: 40px;
  padding-right: 20px;
  border-top-right-radius: $border-radius;
  border-bottom-right-radius: $border-radius;
  box-shadow: $shadow;

  text-decoration: none;

  .material-design-icon {
    margin-right: 10px;
  }
}

.material-design-icon {
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
}
</style>
