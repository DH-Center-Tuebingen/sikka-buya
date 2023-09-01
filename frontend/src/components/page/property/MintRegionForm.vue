<template>
    <PropertyFormWrapper
        property="mint_region"
        @loading="loading"
        :error="error"
        :disabled="disabled"
        :dirty="dirty"
        @submit="submit"
    >
        <input
            type="text"
            name="name"
            v-model="name"
        >
        <Checkbox
            id="mrf-checkbox"
            :value="uncertain"
            v-model="uncertain"
        >
            <template #label>
                <Locale path="property.location_uncertain" />
            </template>
        </Checkbox>
        <LocationInput
            ref="locationInput"
            :interactive="true"
            :allowCircle="true"
            :type="location.type"
            :coordinates="location.coordinates"
            :properties="location.properties"
            @update="updateLocation"
        />
    </PropertyFormWrapper>
</template>

<script>
import Checkbox from "../../forms/Checkbox.vue"
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import LocationInput from '../../forms/LocationInput.vue'
import Locale from '../../cms/Locale.vue';
import Query from '../../../database/query';

export default {
    components: {
        PropertyFormWrapper,
        Checkbox,
        LocationInput,
        Locale
    },
    created() {
        let id = this.$route.params.id;
        if (this.isUpdate) {
            Query.raw(
                `query GetMintRegion($id: ID!){
                    getMintRegion(id: $id){
                        id,
                        name,
                        location
                    }
                }`, { id })
                .then((result) => {
                    const data = result.data.data.getMintRegion;
                    this.name = data.name;
                    this.location = data.location;
                    this.loaded(true)
                })
                .catch((err) => {
                    this.error = this.$t('error.loading_element');
                    console.error(err);
                    this.loaded(false)
                })
        } else {
            this.loaded(true)
        }
    },
    watch: {
        name() {
            this.dirty = true
        },
        location: {
            handler() {
                this.dirty = true
            },
            deep: true
        },
        uncertain() {
            this.dirty = true
        }
    },
    data() {
        return {
            error: "",
            dirty: false,
            loading: true,
            disabled: true,
            name: "",
            location: {
                type: "point",
                coordinates: [0, 0],
                properties: {
                    radius: 3000
                }
            },
            uncertain: false
        }
    },
    methods: {
        loaded(success = true) {
            this.loading = false
            this.disabled = !success
        },
        updateLocation(location) {
            this.location = location
        },
        getMintRegion() {
            return {
                name: this.name,
                location: this.$refs.locationInput.getGeoJSON(),
                uncertain: this.uncertain
            }
        },
        async submit() {
            this.loading = true
            try {
                if (this.isUpdate)
                    await this.update()
                else
                    await this.create()

                this.$router.push({
                    name: 'Property',
                    params: {
                        property: 'mint_region'
                    }
                });
            } catch (err) {
                this.error = this.$t('error.could_not_create_element');
                console.error(err);
            }
            this.loading = false
        },
        create() {
            return Query.raw(`mutation AddMintRegion($data: MintRegionInput!){
                addMintRegion(data: $data)
            }`, { data: this.getMintRegion() }, true)
        },

    },
    computed: {
        id() {
            return this.$route.params.id
        },
        isUpdate() {
            return this.id != null
        }
    }
}
</script>

<style lang="scss" scoped></style>