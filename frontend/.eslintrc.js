module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2024: true
    },
    extends: [
        'plugin:vue/vue2-recommended',
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    rules: {
        "no-unused-vars": "off",
        "no-unreachable": "off",
        "no-inner-declarations": "off",
        "no-prototype-builtins": "off",
        "no-useless-escape": "off",
        "no-extra-semi": "off",
        "vue/html-indent": "off",
        "vue/no-v-for-template-key": "off",
        "vue/multi-word-component-names": "off",
        "vue/no-v-for-template-key": "off",
        "vue/no-v-for-template-key-on-child": "off",
        "vue/no-mutating-props": "off",
        "vue/require-default-prop": "off",
        
    }
}
