<template>
    <PropertyFormWrapper
        class="treasure-form"
        :class="{ dirty: prevent_navigation_mixin_isDirty }"
        :loading="editor_property_load"
        property="treasure"
        @submit="submit"
        :error="error"
    >
        <LabeledInputContainer>
            <template #label>
                <Locale path="general.name" />
            </template>

            <input
                type="text"
                v-model="name"
            >
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.literature" />
            </template>

            <textarea
                type="text"
                v-model="literature"
            ></textarea>
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="general.range" />
            </template>

            <div class="coin-range">
                <RangeInput v-model="timespan" />
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
                :type="location.type"
                :allowRadius="true"
                :radius="locationRadius"
                :coordinates="location.coordinates"
                ref="locationInput"
                @update="(geojson) => location = geojson"
                @updateRadius="(radius)=> locationRadius = radius"
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

            <form-list @add="addItem">

                <TreasureItemForm
                    v-for="(item, index) in items"
                    :key="index"
                    :value="item"
                    @typeChanged="(data) => handleTypeChange(index, data)"
                    @delete="() => items.splice(index, 1)"
                />
            </form-list>
        </LabeledInputContainer>
    </PropertyFormWrapper>
</template>

<script>
import { Treasure, TreasureItem } from '../../../models/property/treasure';
import CsvReader from "@/utils/CsvReader"
import EditorPropertyMixin from "../../mixins/editor-property-mixin"
import ErrorMessage from "@/components/ErrorMessage"
import FileUploadButton from "@/components/layout/buttons/FileUploadButton"
import FormList from "@/components/forms/FormList"
import LabeledInputContainer from "@/components/LabeledInputContainer"
import List from "@/components/layout/List"
import LoadingSpinner from "@/components/misc/LoadingSpinner"
import Locale from '@/components/cms/Locale';
import LocationInput from "@/components/forms/LocationInput"
import PreventNavigationMixin from "../../mixins/prevent-navigation-mixin"
import PropertyFormWrapper from "@/components/page/PropertyFormWrapper"
import Query from "@/database/query"
import RangeInput from '../../forms/RangeInput.vue';
import Toggle from "@/components/layout/buttons/Toggle"
import TreasureItemForm from "./TreasureItemForm"

import { TreasureItemsImporter } from "@/models/importer"

let treasure = new Treasure();
export default {
    mixins: [EditorPropertyMixin, PreventNavigationMixin],
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
            autoComplete: true,
            importing: false,
            error: "",
            name: "",
            literature: "",
            timespan: { from: null, to: null },
            location: { coordinates: [0, 0], type: "circle" },
            locationRadius: 10,
            items: [],
            importErrors: []
        }
    },
    watch: {
        name: {
            handler: function () { this.prevent_navigation_mixin_setDirty() },
        },
        literature: {
            handler: function () { this.prevent_navigation_mixin_setDirty() },
        },
        timespan: {
            handler: function () { this.prevent_navigation_mixin_setDirty() },
            deep: true
        },
        items: {
            handler: function () {
                this.prevent_navigation_mixin_setDirty()
            },
            deep: true
        },
        location: {
            handler: function () { this.prevent_navigation_mixin_setDirty() },
            deep: true
        },
    },
    methods: {
        getCoinRangeFromItems() {
            let timespan = { from: null, to: null }
            this.items.forEach(item => {
                let year = parseInt(item.year)
                console.log(year)
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

                this.items[index].year = data["yearOfMint"]

                namedInputs.forEach(attribute => {
                    this.items[index][attribute] = data[attribute]
                    console.log(this.items[index][attribute])
                })
            }
        },
        addItem() {
            const item = new TreasureItem().forInput()
            this.items.push(item)
        },
        async importItems(event) {
            this.importing = true
            this.importErrors = []
            const file = event.target.files[0]


            const importer = new TreasureItemsImporter()
            await importer.exec(file)
            this.importErrors = importer.errors

            console.log(importer.errorsObject)
            if (importer.errors.length === 0) {
                this.items = importer.items
                this.getCoinRangeFromItems()
            }

            this.importing = false

        },
        async loadProperty() {
            this.editor_property_load = true
            try {
                treasure = await new Treasure().get(this.editor_property_id)
                this.name = treasure.name
                this.timespan = treasure.timespan
                this.literature = treasure.literature
                console.log(treasure.literature, treasure.timespan)

                let location = treasure.location || { coordinates: [0, 0], type: "point" }
                if (location.type.toLowerCase() === "polygon")
                    location.coordinates = location.coordinates[0]

                this.location = location
                this.items = treasure.items.map(item => new TreasureItem(item).forInput())
            } catch (e) {
                let message = e
                if (e instanceof Error) message = e.message
                this.error = Array.isArray(message) ? message.join("\n") : message
            }
            this.editor_property_load = false
        },
        async submit() {
            this.error = ""

            let location = { type: this.location.type, coordinates: this.location.coordinates.slice() }

            if (location.type.toLowerCase() === "polygon")
                location.coordinates = [location.coordinates]
            if(location.type.toLowerCase() === "circle")
                location = this.$refs.locationInput.getGeoJsonFromCircle()

            const treasure = new Treasure({
                name: this.name,
                location: location,
                literature: this.literature,
                timespan: { from: parseInt(this.timespan.from), to: parseInt(this.timespan.to) },
                items: this.items.map(item => {
                    let ti = TreasureItem.fromInputs(item)
                    delete ti.id
                    return ti
                })
            })

            try {
                if (this.editor_property_id) {
                    await treasure.update(this.editor_property_id)
                } else {
                    await treasure.add()
                }
                this.prevent_navigation_mixin_setClean()
                this.$router.push({ name: "Property", params: { property: "treasure" } })
            } catch (e) {
                this.error = Array.isArray(e) ? e.join("\n") : e
            }
        }
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