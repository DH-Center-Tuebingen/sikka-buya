export default class Mixin {

    constructor(name, {
        join = "_",
        vue = null,
    } = {}) {
        this.name = name
        this.join = join
        this.vue = vue
    }

    call(methodName, ...args) {
        if (this.vue) {
            const member = this.member(methodName)
            return this.vue[member](...args)
        } else {
            throw new Error("Vue instance not set.")
        }
    }

    get prefix() {
        return this.name.toLowerCase().replace(/ /g, this.join)
    }

    member(methodName) {
        return `${this.prefix}${this.join}${methodName}`
    }

    throw(msg) {
        throw new Error(`[${this.name}] ${msg}`)
    }

    static throwMissingOverloadError(methodName, mixinName) {
        throw new Error(`Missing implementation: ${methodName}. Mixin "${mixinName}" requires that method to be overloaded.`)

    }
}