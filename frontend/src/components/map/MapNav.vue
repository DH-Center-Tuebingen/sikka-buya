<template>
  <div class="map-nav">
    <div />
    <div class="links">
      <!-- <div class="title">Maps</div> -->

      <router-link
        v-for="route of routes"
        :key="route.routeName"
        :to="{ name: route.routeName }"
        >
{{ route.displayName }}
</router-link>
      <!-- <router-link :class="{active: isRouteActive}" :to="{ name: 'MaterialMap' }">Additional Maps</router-link> -->

      <!-- <router-link
        v-for="route of mapRoutes"
        :key="route.name"
        :to="{ name: route.name }"
        :class="{ active: isRouteActive(route) }"
        >{{ route.name }}</router-link
      > -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      routes: [
        { routeName: 'PoliticalMap', displayName: 'Politische Karte' },
        { routeName: 'MaterialMap', displayName: 'Material Karte' },
      ],
    };
  },
  computed: {
    mapRoutes() {
      return this.$router.options.routes[1].children[5].children;
    },
  },
};
</script>

<style lang="scss" scoped>
.title {
  text-transform: uppercase;
  color: gray;

  font-weight: bold;

  align-items: center;
  padding: $padding $padding * 2;
  //   justify-content: center;
}

.map-nav {
  margin: auto;

  > * {
    display: flex;
  }

  .links {
    position: absolute;
    top: 0px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }

  .links > * {
    $bottom-border-width: 3px;
    display: block;
    padding: $padding 2 * $padding;
    padding-bottom: calc(#{$padding} - #{$bottom-border-width});
    margin: $padding;
    box-sizing: border-box;
    border: $bottom-border-width solid $primary-color;
    border-radius: 30px;
    background-color: rgba(255, 255, 255, 0.8);

    &.router-link-exact-active {
      color: $white;
      background-color: $primary-color;
      font-size: bold;
      border-color: $primary-color;
    }
  }
}
</style>