import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from "./store"
import Settings from './settings'
import { ConfigMixin } from './config'
import I18n from './i18n/i18n';
import VueI18n from 'vue-i18n';
import { camelCase, pascalCase, snakeCase } from 'change-case';
import Selection from './models/selection';
import mconfig from './plugins/mconfig';
import StringUtils from './utils/StringUtils'

async function main() {


  /**Initializes the settings on the first page visit. */
  if (Settings.init(window) > 0) {
    console.warn("All default settings were created.")
  }

  Vue.config.productionTip = false

  Vue.prototype.$utils = {
    capitalize: StringUtils.capitalize,
    snakeCase,
    camelCase,
    pascalCase,
  }

  Vue.use(mconfig, {
    path: "project_settings"
  })

  Vue.prototype.$selection = Selection

  Vue.mixin(ConfigMixin)
  Vue.mixin({
    methods: {
      log(...args) {
        console.log(...args)
      },
    }
  })

  registerGlobalComponents()

  I18n.init()

  new Vue({
    router,
    store,
    i18n: new VueI18n(),
    render: h => h(App)
  }).$mount('#app')
}

main().catch(console.error)

function registerGlobalComponents() {

  Vue.component('calendar-icon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/CalendarBlank"))
  Vue.component('check-icon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/Check"))
  Vue.component('check-emphasis-icon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/CheckBold"))
  Vue.component('ruler-icon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/AccountGroup"))
  Vue.component('mint-icon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/Home"))
  Vue.component('location-icon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/MapMarker"))

}