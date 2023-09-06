export default function ({ watchedVariableName, propertyName } = {}) {
    return {
        created: function () {
            let id = this.$route.params.id;
            if (id != null) {
                this.property_form_mixin_get(id);
            } else {
                this.disabled = false;
                this.$data.loading = false;
            }
        },
        watch: {
            [watchedVariableName]: {
                handler() {
                    this.property_form_mixin_setDirty()
                },
                deep: true
            }
        },
        data() {
            return {
                property_form_mixin_disabled: true,
                property_form_mixin_error: "",
                property_form_mixin_loading: true,
                property_form_mixin_dirty: false,
                property_form_mixin_message: "You have unsaved changes. Are you sure you want to leave this page?"
            }
        },
        methods: {
            // Methods that must be implemented
            //=================================
            getProperty: async function (id) {
                throw new Error("getProperty not implemented", id);
            },
            updateProperty: async function (data) {
                throw new Error("updateProperty not implemented", data);
            },
            createProperty: async function (data) {
                throw new Error("createProperty not implemented", data);
            },
            //=================================
            property_form_mixin_submit: async function () {
                if (this.value.id && this.value.id >= 0) {
                    this.updateProperty(this.$data[watchedVariableName]);
                } else {
                    this.createProperty(this.$data[watchedVariableName]);
                }
            },
            property_form_mixin_cancel: function () {
                this.$router.push({ name: `${this.camelCase(propertyName)}Overview` });
            },
            property_form_mixin_setDirty(value = true) {
                this.property_form_mixin_dirty = value
            },
            property_form_mixin_raiseError(error) {
                this.property_form_mixin_error = error
            },
            property_form_mixin_get: async function (id) {
                this.property_form_mixin_loading = true;
                try {
                    this.$data[watchedVariableName] = await this.getProperty(id);
                    this.property_form_mixin_disabled = false;
                } catch (err) {
                    this.property_form_mixin_error = this.$t('error.loading_element');
                    console.error(err);
                }
                this.property_form_mixin_loading = false;
            },
        },
        getters: {
            property_form_mixin_overwriteRoute() {
                return `${this.camelCase(propertyName)}Overview`
            },
            property_form_mixin_title() {
                return this.$tc(`property.${this.snakeCase(propertyName)}}`)
            }
        }
    }
}