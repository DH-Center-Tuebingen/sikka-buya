<template>
  <header class="navigation" :class="{ minimized }">
    <div class="content-wrapper">
      <div class="brand">
        <router-link :to="{ name: 'Home' }" v-if="!hideLogo">
          <img src="/image/logos/sikka-buya-logo.svg" alt="" />
        </router-link>
      </div>
      <div class="nav-menu" :class="{ active: active }">
        <nav>
          <ul>
            <li
              class="button debug-fill"
              id="debug-notification"
              v-if="$store.state.debug"
              @click="() => $store.commit('disableDebugging')"
            >
              Entwickler Modus Aktiv!
            </li>
            <li
              v-for="(item, index) in visibleItems"
              :key="`nav-item-${index}`" 
            >
              <router-link :to="item.target">
                <Locale :path="item.name" :count="item.count" /></router-link>
            </li>
          </ul>
        </nav>
        <!-- <div class="lang-version-grp">
          <span class="version">{{ version }}</span>
          <div class="languages">DE</div>
        </div> -->

        <div class="nav-toggle" @click="toggleMenu()">
          <Close v-if="active" />
          <Menu v-else />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import AccountShield from 'vue-material-design-icons/ShieldAccount';

import Menu from 'vue-material-design-icons/Menu';
import Close from 'vue-material-design-icons/Close';

import Auth from '../utils/Auth';
import Locale from './cms/Locale.vue';

export default {
  name: 'Navigation',
  components: {
    AccountShield,
    Menu,
    Close,
    Locale
},
  props: {
    hideLogo: Boolean,
  },
  data: function () {
    return {
      active: false,
      minimized: false,
      items: [
        // { name: "Home", target: "undefined" },

        {
          name: 'routes.map',
          target: { name: 'Map Landing' },
          auth: true,
          count: 2,
        },
        {
          name: 'routes.catalog',
          target: { name: 'Catalog' },
          auth: true,
        },
      ],
    };
  },
  methods: {
    toggleMenu: function () {
      this.active = !this.active;
    },
  },
  mounted: function () {
    this.minimized = this.$route.meta.smallNav ? true : false;
  },
  watch: {
    $route(to, from) {
      this.minimized = to.meta.smallNav ? true : false;
    },
  },
  computed: {
    version: function () {
      return this.$store.state.version;
    },
    visibleItems() {
      let items = [];
      if (this.loggedIn) {
        items = this.items;
      } else {
        items = this.items.filter((item) => !item.auth);
      }
      return items;
    },
    loggedIn: function () {
      return this.$store.getters.loggedIn;
    },
  },
};
</script>

<style lang="scss" scoped>

.navigation {
  height: 60px;
}

header {
  // position: sticky;
  background-color: $white;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;

  box-shadow: $shadow;

  .content-wrapper {
    display: flex;
    align-items: center;

    > * {
      padding: $big-padding 0;
    }
  }

  &.minimized {
    img {
      margin-top: 5px;
      height: 30px;
    }

    .content-wrapper {
      width: auto;
      justify-content: space-between;
    }

    .content-wrapper > * {
      padding: 5px 0;
    }
  }
}

.nav-menu {
  display: flex;
  align-items: center;

  z-index: 20000000;

  @include media_phone {
    position: fixed;
    justify-content: flex-end;
    align-items: stretch;
    flex-direction: column-reverse;
    top: 0;
    left: 100vw;
    width: 100vw;
    height: 100%;
    background-color: $white;
    transition: transform 0.3s;

    &.active {
      transform: translateX(-100%);
    }
  }
}

.version {
  opacity: 0.5;
  margin-right: $padding;
}

ul {
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;

  li {
    display: block;
    box-sizing: border-box;
  }

  @include media_phone {
    flex-direction: column;
    margin-top: 3em;
  }
}

.brand {
  margin-right: auto;
  a {
    padding: 0;
  }
  img {
    height: 32px;
  }
}

a {
  color: $black;
  font-weight: normal;

  padding: $padding;
  // text-transform: uppercase;
  display: block;

  @include media_phone {
    padding: 3 * $padding;
    font-size: $large-font;
  }
}

.user {
  display: flex;
  align-items: stretch;
  color: $white;
  border-radius: 20px;
  margin-left: $padding * 2;
  overflow: hidden;
  > :first-child {
    border-right: 2px solid white;
  }

  > * {
    display: block;
    color: $white;
    display: flex;
    white-space: nowrap;
    align-items: center;

    background-color: $primary-color;

    &:hover {
      background-color: lighten($primary-color, 10);
    }

    padding: math.div($padding, 2) $padding;
    @include interactive();
  }

  > div {
    padding-right: 2 * $padding;
  }

  // .material-design-icon {
  //   margin-right: $padding;
  // }

  @include media_phone {
    position: absolute;
    top: 0;
    right: 0;
    justify-content: flex-end;
    > * {
      padding: 3 * $padding;
      background-color: transparent;
      color: $primary-color;

      &:hover {
        color: darken($primary-color, 15%);
        background-color: transparent;
      }
    }
  }
}
.lang-version-grp {
  display: flex;

  @include media_phone {
    justify-content: space-between;

    > * {
      padding: 3 * $padding;
    }
  }
}
@include media_phone {
  .nav-menu.active {
    .nav-toggle {
      transform: translateX(0);
    }
  }
}

.nav-toggle {
  display: none;
  transition: all 0.3s;
  transform: translateX(-100%);
  @include interactive;

  background-color: white;
  @include media_phone {
    display: block;
    align-self: flex-start;
    // position: fixed;

    padding: 2em;
  }
}
#debug-notification {
  font-weight: bold;
  border-radius: $padding;
  padding: $padding;
  margin: 0 $padding;
}
</style>
