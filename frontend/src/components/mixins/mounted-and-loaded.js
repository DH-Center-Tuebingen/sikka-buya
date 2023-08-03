export default function (required = [], {
    verbose = false
} = {}) {
    return {
        data() {
            return {
                triggered: false,
                loadingReqiurements: ["mounted", ...required],
                mounted_and_loaded_mixin_verbose: verbose
            }
        },
        mounted() {
            this.mounted_and_loaded_mixin_loaded("mounted")
        },
        methods: {
            mounted_and_loaded_mixin_loaded(requirement) {
                if (this.mounted_and_loaded_mixin_verbose)
                    console.log("Loaded: ", JSON.stringify(requirement))
                const index = this.loadingReqiurements.indexOf(requirement)
                if (index > -1) {
                    this.loadingReqiurements.splice(index, 1)
                }
                this._mountedAndLoadedChanged()
            },
            _mountedAndLoadedChanged() {
                if (this.loadingReqiurements.length === 0 && this.triggered === false) {
                    this.triggered = true
                    if (this.mounted_and_loaded_mixin_verbose)
                        console.log("All requirements loaded - Calling mountedAndLoaded method ...")
                    this.mountedAndLoaded()
                }
            },
            mountedAndLoaded() {
                console.warn("You are not using the mounted and loaded mixin. Either implement the mountedAndLoaded method or remove the mixin!")
            }
        }
    }
}