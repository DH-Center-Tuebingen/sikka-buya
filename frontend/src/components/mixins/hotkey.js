/**
 * Mixin to handle hotkeys
 *  
 * @param {Map(key, callback)} hotkeyConfig - Object containing hotkey configuration
 */
export default function (hotkeyConfig) {
    return {
        mounted() {
            if (process.env.NODE_ENV === "development") {
                for (const [name, functionName] of Object.entries(hotkeyConfig)) {
                    if (!this.$options.methods[functionName])
                        throw new Error(`Method '${functionName}' does not exist on component ${this.$options.name}`)
                }
            }
            document.addEventListener("keydown", this._hotKeyDown)
        },
        beforeDestroy() {
            document.removeEventListener("keydown", this._hotKeyDown)
        },
        methods: {
            _hotKeyDown(evt) {
                this.handleMap(evt)
                this.keyDown(evt)
            },
            keyDown(evt) {
                // Overload in component
            },
            handleMap(evt) {
                if (hotkeyConfig[evt.key]) {
                    const componentMethod = this.$options.methods[hotkeyConfig[evt.key]]
                    if (!componentMethod)
                        throw new Error(`Method '${hotkeyConfig[evt.key]}' does not exist on component ${this.$options.name}`)
                    else
                        // The call is required as the method is not bound to the component
                        componentMethod.call(this, evt)
                }
            }
        }
    }
}