import ManagedConfig from '../utils/ManagedConfig'

export default {
    install: (Vue, options) => {
        try {
            Vue.prototype.$mconfig = new ManagedConfig(options.path, options.template)
        } catch (e) {
            console.error(e)
        }
    }
}