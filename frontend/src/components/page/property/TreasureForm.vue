<template>
    <PropertyFormWrapper
        property="treasure"
        @submit="property_form_mixin_submit"
        @cancel="property_form_mixin_cancel"
        :loading="property_form_mixin_loading"
        :title="property_form_mixin_title"
        :error="property_form_mixin_error"
        :disabled="property_form_mixin_disabled"
        :dirty="property_form_mixin_dirty"
    >
        {{ property_form_mixin_error }}
        <LabeledInputContainer>
            <template #label>
                <Locale path="general.name" />
            </template>

            <input
                type="text"
                v-model="value.name"
            >
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.literature" />
            </template>

            <textarea
                type="text"
                v-model="value.literature"
            ></textarea>
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.range" />
            </template>

            <div class="coin-range">
                <RangeInput v-model="value.timespan" />
                <Button @click="getCoinRangeFromItems">
                    <Locale path="form.range_from_items" />
                </Button>
            </div>

        </LabeledInputContainer>



        <LabeledInputContainer>
            <template #label>
                <Locale path="general.treasure_spot" />
            </template>
            <LocationInput
                :interactive="true"
                :allowCircle="true"
                :value="value.location"
                ref="locationInput"
                @update="(geojson) => value.location = geojson"
            />
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="property.treasure-items" />
            </template>
            <div class="tools">
                <Toggle v-model="autoComplete">
                    <Locale path="general.auto-complete"></Locale>
                </Toggle>
                <FileUploadButton
                    :loading="importing"
                    @input="importItems"
                    accept=".csv"
                >
                    <Locale path="general.import"></Locale>
                </FileUploadButton>
            </div>

            <ErrorMessage :error="importErrors" />

            <form-list
                @add="addItem"
                :overflowX="true"
            >

                <TreasureItemForm
                    v-for="(item, index) in value.items"
                    :key="index"
                    :value="item"
                    @typeChanged="(data) => handleTypeChange(index, data)"
                    @delete="() => value.items.splice(index, 1)"
                />
            </form-list>
        </LabeledInputContainer>
    </PropertyFormWrapper>
</template>

<script>
import { Treasure, TreasureItem } from '../../../models/property/treasure';
import EditorPropertyMixin from "../../mixins/editor-property-mixin"
import ErrorMessage from "@/components/ErrorMessage"
import FileUploadButton from "@/components/layout/buttons/FileUploadButton"
import FormList from "@/components/forms/FormList"
import LabeledInputContainer from "@/components/LabeledInputContainer"
import List from "@/components/layout/List"
import LoadingSpinner from "@/components/misc/LoadingSpinner"
import Locale from '@/components/cms/Locale';
import LocationInput from "@/components/forms/LocationInput"
import PropertyFormWrapper from "@/components/page/PropertyFormWrapper"
import RangeInput from '../../forms/RangeInput.vue';
import Toggle from "@/components/layout/buttons/Toggle"
import TreasureItemForm from "./TreasureItemForm"

import { TreasureItemsImporter } from "@/models/importer"
import propertyFormMixinFunc from '../../mixins/property-form-mixin-func';

let treasure = new Treasure();
export default {
    mixins: [propertyFormMixinFunc({ variable: "value", property: "treasure" })],
    components: {
        ErrorMessage,
        FileUploadButton,
        FormList,
        LabeledInputContainer,
        List,
        LoadingSpinner,
        Locale,
        LocationInput,
        PropertyFormWrapper,
        RangeInput,
        Toggle,
        TreasureItemForm,
    },
    data() {
        return {
            value: {
                name: "",
                literature: "",
                timespan: { from: null, to: null },
                location: { type: "Feature", geometry: { coordinates: [0, 0], type: "point" }, properties: { radius: 1000 } },
                items: [],
            },
            autoComplete: true,
            importing: false,
            importErrors: []
        }
    },
    methods: {
        getProperty: async function (id) {
            let treasure = await new Treasure().get(id)
            console.log(treasure)
            let location = treasure.location || { coordinates: [0, 0], type: "point" }
            if (location.type.toLowerCase() === "polygon")
                location.coordinates = location.coordinates[0]

            if (!treasure.items) treasure.items = []
            treasure.items = treasure.items.map(item => new TreasureItem(item).forInput())
            return treasure
        },
        updateProperty: async function () {

            const type = this.value?.location?.type
            const coordinates = this.value?.location?.coordinates || [] 

            let location = (type) ? { type, coordinates: coordinates.slice() } : null

            if (location.type.toLowerCase() === "polygon")
                location.coordinates = [location.coordinates]

            const treasure = new Treasure({
                name: this.value.name,
                location: location,
                literature: this.value.literature,
                timespan: { from: parseInt(this.value.timespan.from), to: parseInt(this.value.timespan.to) },
                items: this.value.items.map(item => {
                    let ti = TreasureItem.fromInputs(item)
                    delete ti.id
                    return ti
                })
            })

            if (this.editor_property_id) {
                await treasure.update(this.editor_property_id)
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
            const item = new TreasureItem().forInput()
            this.value.items.push(item)
        },
        async importItems(event) {
            this.importing = true
            this.importErrors = []
            const file = event.target.files[0]


            const importer = new TreasureItemsImporter()
            await importer.execFromFile(file)
            this.importErrors = importer.errors
            if (importer.errors.length === 0) {
                this.value.items = importer.items
                this.getCoinRangeFromItems()
            }

            this.importing = false

        },
    }
}
</script>


<style lang="scss" >
$template-columns: 50px 80px repeat(5, 1fr) 50px 32px;


.treasure-form {
    // .treasure-item-form {
    //     display: grid;
    //     grid-template-columns: $template-columns;
    // }

    // .list-container>* {
    //     &:not(header) {
    //         margin-bottom: 0;
    //     }

    //     &:not(:last-child) {
    //         border-bottom: none;
    //     }
    // }



    // header {
    //     display: grid;
    //     position: sticky;
    //     top: 0;
    //     grid-template-columns: $template-columns;
    //     font-weight: bold;
    //     padding: 2px .5em;
    //     align-items: center;
    //     gap: .5em;
    // }

    .treasure-item-list {
        overflow-x: auto;
    }


    .tools {
        display: flex;
        justify-content: flex-end;
    }

    .coin-range {

        .range-input {
            flex: 1;
        }

        display: flex;
    }

}
</style>