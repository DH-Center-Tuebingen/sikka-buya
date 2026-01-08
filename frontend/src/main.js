import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import store from "./store"
import { ConfigMixin } from './config'
import I18n from './i18n/i18n';
import VueI18n from 'vue-i18n';
import { camelCase, pascalCase, snakeCase } from 'change-case';
import Selection from './models/selection';
import mconfig from './plugins/mconfig';
import StringUtils from './utils/StringUtils'
import L from '@/leaflet'

import Settings from './settings'
import SettingsTemplate from '../settings.json'

export const app = { vue: null }

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
        objectCombine: function (...args) {
            if (!args.length || args.length < 2) throw new Error(`Function 'objectCombine' requires at least two arguments.`)
            let obj = {}

            do {
                const nextObj = args.shift()

                if (nextObj == null) continue
                for (const [nextKey, nextVal] of Object.entries(nextObj)) {
                    if (nextVal == null) continue
                    obj[nextKey] = nextVal
                }
            } while (args.length > 0)

            return obj
        }
    }

    Vue.use(mconfig, {
        path: "project_settings",
        template: SettingsTemplate.project_settings
    })

    Vue.prototype.$selection = Selection
    Vue.prototype.$L = L

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


    window.router = router


    app.vue = new Vue({
        router,
        store,
        i18n: new VueI18n(),
        render: h => h(App)
    }).$mount('#app')
}

main().catch(console.error)

function registerGlobalComponents() {

    Vue.component('CalendarIcon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/CalendarBlank"))
    Vue.component('CheckIcon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/Check"))
    Vue.component('CheckEmphasisIcon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/CheckBold"))
    Vue.component('RulerIcon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/AccountGroup"))
    Vue.component('MintIcon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/Home"))
    Vue.component('LocationIcon', () => import(/* webpackChunkName: "v-icon" */ "vue-material-design-icons/MapMarker"))

}