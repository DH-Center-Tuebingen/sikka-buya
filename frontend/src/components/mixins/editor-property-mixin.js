import Mixin from '../../utils/Mixin';
import mountedAndLoaded from './mounted-and-loaded'

const mixinName = "editor-property-mixin"

const EditorPropertyMixin = {
    mixins: [mountedAndLoaded],
    data() {
        return {
            editor_property_id: null,
            editor_property_mode: "update",
            editor_property_load: true,
        }
    },
    created() {
        this.editor_property_create()
    },
    methods: {
        mountedAndLoaded() {
            this.editor_property_load = false
        },
        async editor_property_create() {
            let id = parseInt(this.$route.params.id);
            if (this.editor_property_validId(id)) {
                this.editor_property_id = id
                try {
                    await this.loadProperty()
                    this.isLoaded()
                } catch (e) {
                    console.error(e)
                }
            } else {
                this.isLoaded()
            }
        },
        editor_property_validId(id) {
            return !isNaN(id) && id >= 0
        },
        loadProperty() {
            Mixin.throwMissingOverloadError("loadProperty", mixinName)
        },
        createProperty() {
            Mixin.throwMissingOverloadError("createProperty", mixinName)
        },
        updateProperty() {
            Mixin.throwMissingOverloadError("updateProperty", mixinName)
        }
    },
    computed: {
        isCreate() {
            return isNaN()
        }
    }
}

export default EditorPropertyMixin