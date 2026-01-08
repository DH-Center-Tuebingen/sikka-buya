<template>
    <div class="historical_region-form">
        <PropertyFormWrapper
            property="historical_region"
            :loading="property_form_mixin_loading"
            :title="property_form_mixin_title"
            :error="property_form_mixin_error"
            :disabled="property_form_mixin_disabled"
            :dirty="property_form_mixin_dirty"
            @submit="property_form_mixin_submit"
            @cancel="property_form_mixin_cancel"
        >
            <input
                id="historical_region-id"
                v-model="historicalRegion.id"
                type="hidden"
            >
            <input
                id="historical_region-name"
                v-model="historicalRegion.name"
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
    mixins: [propertyFormMixinFunc({ property: "historical_region", variable: "historicalRegion" })],
    data: function () {
        return {
            historicalRegion: { id: -1, name: '' },
        };
    },
    methods: {
        getProperty: async function (id) {
            return new Query('historicalRegion').get(id)
        },
        updateProperty: async function () {
            await new Query('historicalRegion').update(this.historicalRegion)
        }
    }
};
</script>
