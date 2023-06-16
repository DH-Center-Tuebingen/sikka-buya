<template>
  <div
    id="app"
    :class="loggedInClass"
    ref="app"
  >
    <LoadingPage v-if="loading" />
    <template v-else>
      <template v-if="offline">
        <router-view></router-view>
      </template>
      <template v-else>
        <user-hub v-if="$store.getters.loggedIn && !$route.meta.hideHub" />

        <router-view></router-view>

        <div
          class="error-popup error"
          :class="{ show: $store.getters.hasErrors }"
        >
          <div
            class="error-message"
            v-for="(error, idx) of $store.getters.errors"
            :key="`error-${idx}`"
          >
            {{ error }}
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import LoadingPage from './components/page/system/LoadingPage.vue';
import PopupHandler from './popup';
import UserHub from './components/auth/UserHub.vue';

import AuthMixin from './components/mixins/auth';
import I18n from './i18n/i18n';

export default {
  components: { UserHub, LoadingPage },
  mixins: [AuthMixin],
  name: 'App',
  data: function () {
    return {
      offline: false,
      loading: true,
      popupHandler: null,
      language: 'de',
    };
  },
  created: async function () {

    try {
      await I18n.load(this)
      await this.authenticateIfAvailable();
    } catch (e) {
      this.offline = true;
      this.$router.replace({ name: "Server Offline" });
    } finally {
      this.loading = false;
    }

    this.popupHandler = new PopupHandler(this);
    this.popupHandler.init(document.body);
  },
  beforeDestroy: function () {
    document.body.removeEventListener("click", this.globalClick)
    this.popupHandler.cleanup();
  },
  mounted: function () {
    /**
     * Disables the default zoom behaviour of the browser.
     */

    this.$refs.app.addEventListener('wheel', (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    });

    /**
     * Sets the debug mode, if in development mode.
     *
     * Debug mode can be enabled by calling 'setDebug()'
     */
    if (process.env.NODE_ENV === 'development') {
      let store = this.$store;
      if (window.debug) store.commit('setDebug');
      window.setDebug = function () {
        store.commit('setDebug');
      };
    }

    document.body.addEventListener("click", this.globalClick)

  },
  methods: {
    globalClick(event) {
      this.$root.$emit("global-click", event)
    },
    goHome: function () {
      if (this.$router.route != '/') this.$router.push('/');
    },
    closeLoginForm: function () {
      this.$store.commit('closeLoginForm');
      this.$store.commit('increment');
    },
  },
  computed: {
    loggedInClass() {
      return this.$store.getters.loggedIn ? 'logged-in' : '';
    },
  },
};
</script>

<style lang="scss">
html,
body {
  margin: 0;
  min-height: 100%;
  background-color: $background-color;
  color: $text-color;
}

body {
  font-family: $font;
  font-size: $regular-font;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

ul.unstyled {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin: 0;
    padding: 0;
  }
}

p {
  line-height: 1.5rem;
}

button,
input {
  font-family: $font;
  font-size: $regular-font;
}

input::placeholder {
  color: $light-gray;
  font-style: italic;
}

.flex {
  display: flex;
}

.flex-fill {
  flex: 1;
}


input[type='color'] {
  flex: unset !important;
  display: block;
  padding: 0;
  min-width: 200px;
  min-height: 40px;
}

$debug-color: orangered !important;

.debug {
  color: $debug-color;
}

.debug-fill {
  color: $white !important;
  background-color: $debug-color;
}

.emph {
  color: $primary-color;
  font-weight: bold;
}

.spinner {
  color: $primary-color;
}

.content-wrapper {
  width: 95%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 100px;
  box-sizing: border-box;

  .content {
    position: relative;
  }
}

@media (max-width: 1080px) {
  .content-wrapper {
    padding: 0 $padding;
  }
}

.centered {
  text-align: center;
}

.center {
  align-self: center;
}

.center-box {
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.padding-box {
  padding: $padding;
}

@include allHeadings {
  font-family: 'Arimo';
}

h1 {
  font-weight: bold;
  font-size: 2.5rem;
  margin-top: 3rem;
  margin-bottom: 2.5rem;
}

h2 {
  font-size: 1.5rem;
  // font-weight: bold;
  margin-block-end: 1rem;
}

h6 {
  font-size: 1rem;
  color: $gray;

  margin-block-start: 1.5rem;
  margin-block-end: 1rem;
}

.subtitled {


  text-align: left;

  .subtitle {
    font-size: 0.641em;
    color: currentColor;
  }
}

.subtitle {
  display: block;
  color: $black;
  border-color: $black !important;
  font-size: $large-font;
  text-transform: uppercase;
  // font-weight: bold;
}

.mint-label {
  color: $gray;
  font-size: $regular-font;
  font-weight: bold;
}

.circle-marker {
  transform-box: fill-box;
  transform-origin: center;

  transition: transform 0.3s, background-color 0.3s;
  transform: scale(1);
}


.circle-marker.added,
.circle-marker.removed {
  pointer-events: none;
}

.circle-marker.added {
  animation: growing 1s 1;
}

.circle-marker.removed {
  animation: shrinking 0.5s 1;
}


@keyframes growing {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes shrinking {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.8);
  }

  100% {
    transform: scale(1);
  }
}

.hero {
  width: 100%;
  height: 100%;
}

section {
  // margin-top: 5em;

  h3 {
    font-size: 1.5em;
    font-weight: bold;
  }
}

hr {
  border: solid 3px $light-gray;
  border-radius: 2px;
  margin: 2rem 20px;
}

.bling hr {
  border-color: $light-gray;
  border-style: dotted;
  border-width: 5px;
  border-bottom: none;

  margin: $large-padding * 4 0;
}

#app-name {
  color: $primary-color;
  margin-right: $padding;
  text-transform: none;
  font-weight: 800;

  @include interactive();
}

.property-group {
  margin-bottom: 1rem;
}

#app-name:after {
  content: '|';
  color: white;
  margin: 0 20px;
}

select,
input,
button {
  @include input;
  box-sizing: border-box;
}

button[type='submit'] {
  color: white;
  background-color: $primary-color;

  &:hover {
    background-color: darken($color: $primary-color, $amount: 5);
  }
}

.button,
button {
  display: flex;
  align-items: center;
  justify-content: center;
  @include input;
  @include interactive();

  border-radius: 3px;

  >.material-design-icon:not(:last-child) {
    width: 1.3em;
    margin-right: $padding;
  }

  .flip {
    transform: scaleX(-1);
  }

  &.rounded {
    border-radius: 0.5em;
  }

  &.small-button {
    font-size: $small-font;
    padding: 0 $small-padding * 2;
  }
}

.disabled {
  pointer-events: none;
  color: $light-gray;
}

.button.small-button {
  font-size: $small-font;
}

.button.ghost-btn {
  position: absolute;
  right: 0;
  border: none;
  border-radius: 0;
  background-color: rgba($gray, 0);
  color: $gray;

  &:hover {
    background-color: rgba($gray, 0.5);
  }
}

.button-list,
li {
  &:not(:last-child-of-type)>.button {
    border-bottom: none;
  }

  >.button {
    border-radius: 0;
  }
}

.transparent-button {
  background-color: transparent;
  border: none;

  &:hover {
    background-color: rgba(#000000, 0.1);
  }
}

.label,
label {
  color: $gray;
  font-weight: bold;
  font-size: $regular-font;
  display: block;
}

label {
  @include interactive();
}

.button-bar {
  display: flex;

  >* {
    flex: 1;
  }

  >*:not(:last-child) {
    margin-right: 10px;
  }
}

.top-header {
  // color: white;
  // background-color: rgb(75, 75, 75);

  .button-group {
    input:checked+label {
      background-color: transparent;
      border-bottom: 2px solid white;

      border-top-right-radius: unset;
      border-top-left-radius: unset;
      border-bottom-right-radius: unset;
      border-bottom-left-radius: unset;
    }

    label {
      background-color: transparent;
      border-radius: 0;
      border: none;
      padding: $padding;
    }
  }
}

a {
  @include linkStyle();
}

.disabled-link {
  color: $light-gray;
  pointer-events: none;
}

.icon-button {
  text-transform: capitalize;
  display: flex;
  align-items: center;

  background: none;
  padding: 0;
  border: none;
  color: currentColor;

  :first-child:not(:last-child) {
    margin-right: $padding;
  }
}

.tooltip-container {
  position: relative;
}

.div-icon-button {
  cursor: pointer;
  position: relative;

  &:hover {
    background-color: $dark-white;
  }
}

.div-icon-button+.tooltip {
  opacity: 0;
  position: absolute;
  top: -5px;
  left: 50%;
  min-width: 150px;
  transform: translate(-50%, -100%);
  padding: $small-padding;
  border-radius: $small-border-radius;
  background-color: white;
  transition: all $transition-time;
}

.div-icon-button:hover+.tooltip {
  opacity: 1;
}

.div-icon {
  background-color: $white;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: bold;
  border-radius: 10px;
}

.button-list {
  >* {
    margin-bottom: $padding;
  }
}

.error {
  font-weight: bold;
  color: $red;
}

.material-design-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
  gap: $padding;
}

.col-1-2 {
  grid-template-columns: 1fr 2fr;
}

@mixin grid-even-columns {
  @for $i from 2 through 6 {
    .col-#{$i} {
      grid-template-columns: repeat($i, 1fr);
    }
  }
}

@include grid-even-columns();

.error-popup.show {
  bottom: $padding;
  transform: translateX(-50%) translateY(0);
}

.error-popup {
  position: fixed;
  width: 720px;
  bottom: 0;

  background-color: $red;
  color: $white;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  padding: $padding;
  border-radius: $small-border-radius;
  z-index: 99999999999;

  transition: all $transition-time;

  >* {
    margin-top: $big-padding;
    margin-bottom: $big-padding;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.hint {
  // font-weight: bold;
  font-style: italic;
  color: $light-gray;
}

.note {
  display: block;
  font-size: $small-font;
  color: $primary-color;
  font-style: italic;
}

.map-page .top-right-toobar {
  margin: $padding;
  display: inline-block;
}

.popup-content {
  padding-bottom: 10px;
}

.grayedOut {
  opacity: 0.3;
  background-color: gray;
}

.unavailable {
  color: gray;
}

.gray-heading {
  color: $gray;
  margin: 0;
}

.underlined-header {
  padding: $padding $big-padding;
  border-bottom: $border;
}

.black {
  color: $black;
}
</style>
