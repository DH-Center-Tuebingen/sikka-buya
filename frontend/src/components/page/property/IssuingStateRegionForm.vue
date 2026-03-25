<template>
    <div class="issuing_state-form">
        <PropertyFormWrapper
            property="issuing_state"
            :loading="property_form_mixin_loading"
            :title="property_form_mixin_title"
            :error="property_form_mixin_error"
            :disabled="property_form_mixin_disabled"
            :dirty="property_form_mixin_dirty"
            @submit="property_form_mixin_submit"
            @cancel="property_form_mixin_cancel"
        >
            <input
                id="issuing_state-id"
                v-model="issuingStateRegion.id"
                type="hidden"
            >
            <input
                id="issuing_state-name"
                v-model="issuingStateRegion.name"
                type="text"
                :placeholder="$tc('attribute.name')"
                autofocus
                required
            >
        </PropertyFormWrapper>
    </div>
</template>

<script>
import Query from '../../../database/query.js';
import propertyFormMixinFunc from '../../mixins/property-form-mixin-func.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';

export default {
    components: { PropertyFormWrapper },
    mixins: [propertyFormMixinFunc({ property: "issuing_state_region", variable: "issuingStateRegion" })],
    data: function () {
        return {
            issuingStateRegion: { id: -1, name: '' },
        };
    },
    methods: {
        getProperty: async function (id) {
            return new Query('issuingStateRegion').get(id)
        },
        updateProperty: async function () {
            await new Query('issuingStateRegion').update(this.issuingStateRegion)
        }
    }
};
</script>
