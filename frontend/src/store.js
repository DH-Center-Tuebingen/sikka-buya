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
    }
  }, getters: {
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