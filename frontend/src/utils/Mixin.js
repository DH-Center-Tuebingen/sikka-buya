export default class Mixin {
    static throwMissingOverloadError(methodName, mixinName) {
        throw new Error(`Missing implementation: ${methodName}. Mixin "${mixinName}" requires that method to be overloaded.`)

    }
}