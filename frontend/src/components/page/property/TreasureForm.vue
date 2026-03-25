<template>
    <PropertyFormWrapper
        property="treasure"
        :overwrite-route="{ name: 'TreasureOverview' }"
        :loading="property_form_mixin_loading"
        :title="property_form_mixin_title"
        :error="property_form_mixin_error"
        :disabled="property_form_mixin_disabled"
        :dirty="property_form_mixin_dirty"
        class="treasure-form"
        @submit="property_form_mixin_submit"
        @cancel="property_form_mixin_cancel"
    >
        <template #header>
            <ErrorMessage :error="importErrors" />
        </template>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.name" />
            </template>

            <input
                id="treasure-name-input"
                v-model="value.name"
                style="font-weight: bold; font-size: 2rem;"
                type="text"
            >
        </LabeledInputContainer>

        <div
            class="flex row"
            style="gap: 5px;"
        >
            <Toggle
                v-model="value.singleFind"
                style="flex:1; font-weight:bold; padding-top: 8px; padding-bottom: 8px;"
            >
                Single Find
            </Toggle>

            <Toggle
                v-model="value.reliableAttribution"
                style="flex:1; font-weight:bold; padding-top: 8px; padding-bottom: 8px;"
            >
                Reliable Attribution
            </Toggle>

            <Toggle
                v-model="value.completeHoard"
                style="flex:1; font-weight:bold; padding-top: 8px; padding-bottom: 8px;"
            >
                Complete Hoard
            </Toggle>

            <Toggle
                v-model="value.ottomanPredominance"
                style="flex:1; font-weight:bold; padding-top: 8px; padding-bottom: 8px;"
            >
                Ottoman Predominance
            </Toggle>
        </div>

        <LabeledInputContainer>
            <template #label>
                Subclassification
            </template>

            <input
                id="treasure-name-input"
                v-model="value.subclassification"
                type="text"
            >
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                Circumstances
            </template>

            <SimpleFormattedField
                id="treasure-description-input"
                ref="descriptionField"
                :allow-links="true"
            />
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                Collection
            </template>

            <input
                v-model="value.collection"
                type="text"
            >
        </LabeledInputContainer>


        <LabeledInputContainer>
            <template #label>
                Publication
            </template>

            <input
                v-model="value.publication"
                type="text"
            >
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.range" />
            </template>

            <div class="coin-range">
                <RangeInput
                    id="treasure-timespan-input"
                    v-model="value.timespan"
                />
                <ButtonVue @click="getCoinRangeFromItems">
                    <Locale path="form.range_from_items" />
                </ButtonVue>
            </div>
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.color" />
            </template>
            <ColorInput
                id="treasure-color-input"
                v-model="value.color"
            />
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.treasure_spot" />
            </template>
            <LocationInput
                id="treasure-location-input"
                ref="locationInput"
                :interactive="true"
                :allow-circle="true"
                :value="value.location"
                @update="updateLocation"
            />
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="property.treasure-items" />
            </template>
            <div class="tools">
                <div style="flex:1;">
                    Total Coins {{ value.count || 0 }}
                </div>
            </div>



            <OttomanTreasureItemTable
                v-model="value.items"
                style="max-height: 50vh;"
            />
            <ButtonVue @click="addItem">
                <Locale path="form.add_item" />
            </ButtonVue>

            <!-- <div class="list-shadow">
                <form-list
                    id="treasure-item-list"
                    @add="addItem"
                >
                    <TreasureItemForm
                        v-for="(item, index) in value.items"
                        :key="index"
                        :index="index + 1"
                        :value="item"
                        @typeChanged="(data) => handleTypeChange(index, data)"
                        @delete="() => value.items.splice(index, 1)"
                    />
                </form-list>
            </div> -->
        </LabeledInputContainer>
    </PropertyFormWrapper>
</template>

<script>
// import { Treasure, TreasureItem } from '../../../models/property/treasure';
import ButtonVue from "@/components/layout/buttons/Button.vue"
import ErrorMessage from "@/components/ErrorMessage"
import LabeledInputContainer from "@/components/LabeledInputContainer"
import Locale from '@/components/cms/Locale';
import LocationInput from "@/components/forms/LocationInput"
import PropertyFormWrapper from "@/components/page/PropertyFormWrapper"
import RangeInput from '../../forms/RangeInput.vue';
import Toggle from "@/components/layout/buttons/Toggle"
import SimpleFormattedField from "@/components/forms/SimpleFormattedField"

import { TreasureItemsImporter, CsvExporter } from "@/models/importer"
import propertyFormMixinFunc from '../../mixins/property-form-mixin-func';
import ColorInput from '../../forms/ColorInput.vue';
import OttomanTreasureItemTable from '@/components/Ottoman/OttomanTreasureItemTable.vue';

import { OttomanTreasure, OttomanTreasureItem } from '@/components/Ottoman/ottoman-treasure-item';

const defaultLocation = { type: "Feature", geometry: { coordinates: null, type: "point" }, properties: { radius: 1000 } }

export default {
    components: {
        ButtonVue,
        ErrorMessage,
        // FormList,
        LabeledInputContainer,
        Locale,
        LocationInput,
        PropertyFormWrapper,
        RangeInput,
        SimpleFormattedField,
        Toggle,
        // TreasureItemForm,
        ColorInput,
        OttomanTreasureItemTable,
    },
    mixins: [propertyFormMixinFunc({ variable: "value", property: "treasure", overwriteCancelRoute: { name: "TreasureOverview" } })],
    data() {
        return {
            value: {
                collection: "",
                color: "#000000",
                completeHoard: false,
                description: "",
                items: [],
                location: defaultLocation,
                name: "",
                ottomanPredominance: false,
                publication: "",
                reliableAttribution: false,
                singleFind: false,
                subclassification: "",
                timespan: { from: null, to: null },
            },
            autoComplete: true,
            importing: false,
            importErrors: []
        }
    },
    mounted() {
        this.property_form_mixin_mount()
    },
    methods: {
        updateLocation(value) {
            this.value.location = value
        },
        onPropertyLoaded() {
            // When the location input was hidden and
            // is shown, the leaflet map does not have the 
            // correct size which leads to a malfunctioning map.
            // This fixes it.
            this.$refs.locationInput.updateSize()
        },
        getProperty: async function (id) {
            const ottomanTreasure = new OttomanTreasure()
            let treasure = await ottomanTreasure.get(id)
            let location = treasure.location || defaultLocation

            treasure.location = location
            this.$refs.descriptionField.setContent(treasure.description)

            if (!treasure.items) treasure.items = []
            treasure.items = treasure.items.map(item => new OttomanTreasureItem(item).forInput())

            return treasure
        },
        updateProperty: async function () {
            const treasure = new OttomanTreasure({
                collection: this.value.collection,
                color: this.value.color,
                completeHoard: this.value.completeHoard,
                description: this.$refs.descriptionField.getContent(),
                location: this.$refs.locationInput.getGeoJSON(),
                name: this.value.name,
                ottomanPredominance: this.value.ottomanPredominance,
                publication: this.value.publication,
                reliableAttribution: this.value.reliableAttribution,
                singleFind: this.value.singleFind,
                subclassification: this.value.subclassification,

                timespan: { from: parseInt(this.value.timespan.from), to: parseInt(this.value.timespan.to) },
                items: this.value.items.map(item => {
                    let ti = OttomanTreasureItem.fromInputs(item)
                    delete ti.id
                    return ti
                })
            })

            if (this.id) {
                await treasure.update(this.id)
            } else {
                await treasure.add()
            }

        },
        getCoinRangeFromItems() {
            let timespan = { from: null, to: null }
            this.value.items.forEach(item => {
                let year = parseInt(item.year)
                if (!isNaN(year)) {
                    if (timespan.from == null || year < timespan.from) timespan.from = year
                    if (timespan.to == null || year > timespan.to) timespan.to = year
                }
            })

            this.timespan = timespan
        },
        handleTypeChange(index, data) {
            if (this.autoComplete && data.id != null) {
                const namedInputs = ["mint", "material", "nominal"]

                this.value.items[index].year = data["yearOfMint"]

                namedInputs.forEach(attribute => {
                    this.value.items[index][attribute] = data[attribute]
                })
            }
        },
        addItem() {
            const item = new OttomanTreasureItem().forInput()
            // const item = new TreasureItem().forInput()
            this.value.items.push(item)
        },
    }
}
</script>


<style lang="scss">
.treasure-form {

    .list-shadow {
        position: relative;

        &:before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: $border-radius;
            box-shadow: inset -20px -20px 40px rgba($black, .2);
            pointer-events: none;
        }
    }

    .list {
        position: relative;
        margin-top: 10px;
        max-height: 50vh;
        overflow: auto;
        padding: $padding;
    }

    .treasure-item-list {
        overflow-x: auto;
    }


    .tools {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: $padding;

        label {
            margin-bottom: 0;
        }
    }

    .coin-range {

        .range-input {
            flex: 1;
        }

        display: flex;
    }

}
</style>