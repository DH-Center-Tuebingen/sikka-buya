export default function ({ variable = null, property = null, overwriteCancelRoute = null } = {}) {


    if (!property) {
        throw new Error("property must be defined")
    }

    if (!variable)
        variable = property

    const cancelRoute = (overwriteCancelRoute) ? overwriteCancelRoute : { path: `/editor/${property}` }

    return {
        mounted() {
            this.property_form_mixin_mount()
        },
        watch: {
            [variable]: {
                handler() {
                    if (this.property_form_mixin_initialized)
                        this.property_form_mixin_setDirty()
                },
                deep: true
            }
        },
        data() {
            return {
                property_form_mixin_initialized: false,
                property_form_mixin_error: "",
                property_form_mixin_loading: true,
                property_form_mixin_dirty: false,
                property_form_mixin_message: "You have unsaved changes. Are you sure you want to leave this page?"
            }
        },
        methods: {
            property_form_mixin_mount() {
                this.property_form_mixin_initialize()
            },
            // Methods that must be implemented
            //=================================
            getProperty: async function (id) {
                throw new Error("getProperty not implemented", id);
            },
            updateProperty: async function (data) {
                throw new Error("updateProperty not implemented", data);
            },
            onPropertyLoaded: async function () {
                // optional callback when the component is ready.
            },
            //=================================
            property_form_mixin_initialize: async function () {
                this.property_form_mixin_loading = true
                try {
                    if (this.id) {
                        const result = await this.getProperty(this.id)
                        if (result != null)
                            this[variable] = result
                        else throw new Error(`Property with id='${this.id}' does not exist.`)

                    }

                    // We set the initialized in the next cycle so that
                    // the watcher is not triggered in this cycle.
                    this.$nextTick(() => {
                        this.property_form_mixin_initialized = true
                        this.onPropertyLoaded()
                    })
                } catch (e) {
                    console.error(e)
                    this.property_form_mixin_raiseError(e)
                }

                this.property_form_mixin_loading = false
            },
            property_form_mixin_submit: async function (e) {
                this.property_form_mixin_loading = true
                try {
                    await this.updateProperty(this.$data[variable]);
                    this.property_form_mixin_cancel()
                } catch (e) {
                    console.error(e)
                    this.property_form_mixin_raiseError(e)
                }
                this.property_form_mixin_loading = false
            },
            property_form_mixin_cancel: function () {
                this.$router.push(cancelRoute)
            },
            property_form_mixin_setDirty(value = true) {
                this.property_form_mixin_dirty = value
            },
            property_form_mixin_raiseError(errorMessage) {
                this.property_form_mixin_error = errorMessage
            },
        },
        computed: {
            property_form_mixin_disabled() {
                return !this.property_form_mixin_initialized && !this.property_form_mixin_dirty && !this.property_form_mixin_loading
            },
            property_form_mixin_title() {
                return this.$tc(`property.${this.$utils.snakeCase(property)}}`)
            },
            id() {
                return this.$route.params.id || null
            }
        }
    }
}