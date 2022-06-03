import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex)

let version = require("../../package.json").version;

const store = new Vuex.Store({
  state: {
    user: null,
    availableLanguages: ["de", "en"],
    language: "de",
    showLoginForm: false,
    showConfirmation: true,
    version,
    errors: []
  },
  mutations: {
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
      console.log("PRINT", error)

      if (!Array.isArray(error)) error = [error]
      state.errors.push(...error)

      setTimeout(() => state.errors.shift(0, error.length), 5000)
    },
    resetErrors(state) {
      console.log("RESET")
      state.errors = []
    }
  }, getters: {
    loggedIn: state => {
      return !!state.user
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