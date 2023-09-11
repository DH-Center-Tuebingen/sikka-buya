<template>
    <PropertyFormWrapper
        property="mint_region"
        @submit="property_form_mixin_submit"
        @cancel="property_form_mixin_cancel"
        :loading="property_form_mixin_loading"
        :title="property_form_mixin_title"
        :error="property_form_mixin_error"
        :disabled="property_form_mixin_disabled"
        :dirty="property_form_mixin_dirty"
    >
        <pre>
    </pre>
        <input
            type="text"
            name="name"
            v-model="mintRegion.name"
        >
        <Checkbox
            id="mrf-checkbox"
            v-model="mintRegion.uncertain"
        >
            <template #label>
                <Locale path="property.location_uncertain" />
            </template>
        </Checkbox>
        <LocationInput
            ref="locationInput"
            :interactive="true"
            :allowCircle="true"
            :value="mintRegion.location"
            @update="updateLocation"
        ></LocationInput>
    </PropertyFormWrapper>
</template>

<script>
import Checkbox from "../../forms/Checkbox.vue"
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import LocationInput from '../../forms/LocationInput.vue'
import Locale from '../../cms/Locale.vue';
import Query from '../../../database/query';
import propertyFormMixinFunc from '../../mixins/property-form-mixin-func';

export default {
    name: "MintRegionForm",
    components: {
        PropertyFormWrapper,
        Checkbox,
        LocationInput,
        Locale
    },
    mixins: [
        propertyFormMixinFunc({ property: "mintRegion" })
    ],
    data() {
        return {
            mintRegion: {
                name: "",
                uncertain: false,
                location: {
                    type: "point",
                    coordinates: [0, 0],
                    properties: {
                        radius: 3000
                    }
                }
            },
        }
    },
    methods: {
        getProperty: async function (id) {
            const result = await Query.raw(
                `query GetMintRegion($id: ID!){
                    getMintRegion(id: $id){
                        id,
                        name,
                        location,
                        uncertain
                    }
                }`, { id })

            console.log(result.data.data.getMintRegion.uncertain)

            return result.data.data.getMintRegion;
        },
        updateProperty: async function () {
            if (this.id) {
                await this.update()
            } else {
                await this.create()
            }
        },
        updateLocation(location) {
            this.mintRegion.location = location
        },
        getMintRegion() {
            return {
                name: this.mintRegion.name,
                location: this.$refs.locationInput.getGeoJSON(),
                uncertain: this.mintRegion.uncertain
            }
        },
        create() {
            return Query.raw(`mutation AddMintRegion($data: MintRegionInput!){
                addMintRegion(data: $data)
            }`, { data: this.getMintRegion() }, true)
        },
        update() {
            return Query.raw(`mutation UpdateMintRegion($id:ID!, $data: MintRegionInput!){
                updateMintRegion(id: $id,data: $data)
            }`, { data: this.getMintRegion(), id: this.id }, true)
        }

    },
}
</script>

<style lang="scss" scoped></style>