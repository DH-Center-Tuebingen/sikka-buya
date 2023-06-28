
export default function (name, variables = []) {

    const watch = variables.reduce((acc, key) => {
        acc[key] = function (newVal, oldVal) {
            console.log("SAVE LOCALSTORAGE")
            this.local_storage_mixin_save()
        }
        return acc
    }, {})

    return {
        data() {
            return {
                local_storage_mixin_name: name,
                local_storage_mixin_variables: variables
            }
        },
        watch,
        mounted() {
            this.$nextTick(() => {
                let data = {}
                if (localStorage.getItem(this.local_storage_mixin_name) != null) {
                    let data_str = localStorage.getItem(this.local_storage_mixin_name)
                    if (data_str != null) {
                        try {
                            data = JSON.parse(data_str)
                        } catch (e) {
                            console.error("Could not parse stored data: ", e)
                        }
                    }

                    this.local_storage_mixin_variables.forEach(key => {
                        if (Object.prototype.hasOwnProperty.call(this.$data, key)) {
                            this.$data[key] = data[key]
                        }
                    })
                }
            })
        },
        methods: {
            local_storage_mixin_save() {
                const data = {}
                this.local_storage_mixin_variables.forEach(key => {
                    try {
                        if (Object.prototype.hasOwnProperty.call(this.$data, key) && this.$data[key] != null) {
                            data[key] = this.$data[key]
                        }
                    } catch (e) {
                        console.error(`Could not stringify key '${key}' of localstore ${this.name}.`, e)
                    }
                })
                try {
                    localStorage.setItem(this.local_storage_mixin_name, JSON.stringify(data))
                } catch (e) {
                    console.warn(e)
                }
            }
        }
    }
}