/**
 * This module exports a mixin object that provides functionality to prevent navigation when there are unsaved changes in the current page.
 * 
 * @module prevent-navigation-mixin
 * @typedef {Object} PreventNavigationMixin
 * @property {boolean} prevent_navigation_mixin_isDirty - A boolean flag that indicates whether there are unsaved changes in the current page.
 * @property {string} prevent_navigation_mixin_message - A message to display to the user when they try to navigate away from the current page with unsaved changes.
 * @property {Function} beforeWindowUnload - A method that is called when the user tries to navigate away from the current page. It prevents the navigation and displays the message to the user.
 * @property {Function} prevent_navigation_mixin_setDirty - A method that sets the prevent_navigation_mixin_isDirty flag to true.
 * @property {Function} prevent_navigation_mixin_setClean - A method that sets the prevent_navigation_mixin_isDirty flag to false.
 */
export default {
    data() {
        return {
            prevent_navigation_mixin_isDirty: false,
            prevent_navigation_mixin_message: "You have unsaved changes. Are you sure you want to leave this page?"
        }
    },
    methods: {
        beforeWindowUnload(e) {
            // We do this to prevent the user from overwriting the message with an illegal value
            const message = this.prevent_navigation_mixin_message || "You have unsaved changes. Are you sure you want to leave this page?"
            if (this.prevent_navigation_mixin_isDirty) {
                e.preventDefault();
                e.returnValue = message
                return message
            }
        },
        prevent_navigation_mixin_setDirty(value = true) {
            this.prevent_navigation_mixin_isDirty = value
        },
        prevent_navigation_mixin_setClean() {
            this.prevent_navigation_mixin_setDirty(false)
        }
    },
    created() {
        window.addEventListener("beforeunload", this.beforeWindowUnload)
    },
    beforeDestroy() {
        window.removeEventListener("beforeunload", this.beforeWindowUnload)
    },
    beforeRouteLeave(to, from, next) {
        let preventNav = this.prevent_navigation_mixin_isDirty && !confirm(this.prevent_navigation_mixin_message)

        if (!preventNav) {
            next()
        } else next(false)
    }
}