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
        class="treasure-form"
    >

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

            <div class="list-shadow">
                <form-list @add="addItem">

                    <TreasureItemForm
                        v-for="(item, index) in value.items"
                        :key="index"
                        :index="index"
                        :value="item"
                        @typeChanged="(data) => handleTypeChange(index, data)"
                        @delete="() => value.items.splice(index, 1)"
                    />
                </form-list>
            </div>
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
import Query from '../../../database/query';

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
    mounted: async function () {
        try {
            await Query.raw(`query Geo($d: GeoJSON){
        geojson(d: $d)
            }`,
                {d:{
                    type: "Polygon",
                    coordinates: [[35.000753578642396, 57.72305529156035], [35.000753578642396, 61.67865367097683], [30.114245744598513, 61.67865367097683], [30.871582821957475, 55.74525610185211], [35.000753578642396, 57.72305529156035]]
        }}, true)
    }catch(e) {
        console.error(e)
    }
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
        treasure.location = location

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