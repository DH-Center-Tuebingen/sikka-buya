import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex)

let version = require("../../package.json").version;


let editmode = false
try {
    const loadedConfig = localStorage.getItem("sikka-buya-store")
    const conf = JSON.parse(loadedConfig)
    if (conf.editmode) editmode = conf.editmode
} catch (e) {
    //Silently fail.
}

const store = new Vuex.Store({
    state: {
        activeBaseLayer: localStorage.getItem("sikka-buya-active-baselayer") ? parseInt(localStorage.getItem("sikka-buya-active-baselayer")) : 0,
        baseLayers: [
            {
                name: "satellite",
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                image: "/image/ottoman/map-baselayer-previews/satellite.png"
            },
            {
                name: "modern",
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
                image: "/image/ottoman/map-baselayer-previews/modern.png",
                attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
            },
            {
                name: "topo",
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
                image: "/image/ottoman/map-baselayer-previews/topo.png",
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
            },
        ],
        editmode,
        user: null,
        availableLanguages: ["de", "en"],
        language: "de",
        showLoginForm: false,
        showConfirmation: true,
        version,
        errors: [],
        debug: false
    },
    mutations: {
        changeBaseMapUrl(state, url) {
            state.baseMapUrl = url
        },
        setDebug(state) {
            if (process.env.NODE_ENV === 'development') {
                state.debug = true
                window.debug = true
            }
        },
        toggleEditMode(state) {
            state.editmode = !state.editmode
            localStorage.setItem("sikka-buya-store", JSON.stringify({ editmode: state.editmode }))

        },
        disableDebugging(state) {
            state.debug = false
            window.debug = false
        },
        login(state, user) {
            state.user = user
        },
        logout(state) {
            state.user = null
        },
        showLoginForm(state) {
            state.showLoginForm = true
        },
        closeLoginForm(state) {
            state.showLoginForm = false
        }, increment(state) {
            state.test++
        },
        changeLanguage(state, lang) {
            if (state.availableLanguages.indexOf(lang) != -1)
                state = lang
            else console.error(`Requested language is not supported: ${lang}.`)
        },
        printError(state, error) {
            if (!Array.isArray(error)) error = [error]
            state.errors.push(...error)
            setTimeout(() => state.errors.shift(0, error.length), 5000)
        },
        resetErrors(state) {
            state.errors = []
        },
        selectBaseLayer(state, index) {
            if (index >= 0 && index < state.baseLayers.length) {
                state.activeBaseLayer = index
                localStorage.setItem("sikka-buya-active-baselayer", index)
            }
        }
    }, getters: {
        activeBaseLayer(state) {
            return state.baseLayers[state.activeBaseLayer]
        },
        loggedIn: state => {
            return !!state.user
        },
        userHasPermission(state, getters) {
            return (name) => {
                return getters.loggedIn && (state.user.super || state.user.permissions.includes(name))
            }
        },
        permissions(state) {
            let permissions = []
            if (state.user?.permissions) {
                permissions = state.user.permissions
            }
            if (state.user?.super) permissions.push("super")
            return permissions
        },
        editor(state, getters) {
            return getters.userHasPermission("editor")
        },
        writer(state, getters) {
            return getters.userHasPermission("writer")
        },
        isEditableByWriter(state, getters) {
            return state.editmode && getters.writer
        },
        hasErrors(state) {
            return state.errors.length > 0
        },
        errors(state) {
            return state.errors
        }
    }
})


export default store