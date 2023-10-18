export default class Mixin {

    constructor(name, {
        join = "_",
    } = {}) {
        this.name = name
        this.join = join
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