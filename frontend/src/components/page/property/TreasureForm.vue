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
                <Locale path="general.treasure_spot" />
            </template>
            <LocationInput
                :interactive="true"
                :type="location.type"
                :coordinates="location.coordinates"
                @update="(geojson) => location = geojson"
            />
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="property.treasure-items" />
            </template>
            <div class="tools">
                <FileUploadButton :loading="importing">
                    <Locale path="general.import"></Locale>

                </FileUploadButton>
            </div>


            <form-list @add="addItem">
                <header>
                    <div class="count">
                        <Locale path="general.count" />
                    </div>
                    <div class="year">
                        <Locale path="property.year_of_mint" />
                    </div>
                    <div class="mint">
                        <Locale path="property.mint" />
                    </div>
                    <div class="dynasty">
                        <Locale path="property.dynasty" />
                    </div>
                    <div class="nominal">
                        <Locale path="property.nominal" />
                    </div>
                    <div class="material">
                        <Locale path="property.material" />
                    </div>
                    <div class="fragment">
                        <Locale path="general.fragment" />
                    </div>
                </header>
                <TreasureItemForm
                    v-for="(item, index) in items"
                    :key="index"
                    :value="item"
                    @delete="() => items.splice(index, 1)"
                />
            </form-list>
        </LabeledInputContainer>
    </PropertyFormWrapper>
</template>

<script>
import Locale from '@/components/cms/Locale';
import LabeledInputContainer from "@/components/LabeledInputContainer"
import { Treasure, TreasureItem } from '../../../models/property/treasure';
import LocationInput from "@/components/forms/LocationInput"
import LoadingSpinner from "@/components/misc/LoadingSpinner"
import List from "@/components/layout/List"
import FormList from "@/components/forms/FormList"
import PropertyFormWrapper from "@/components/page/PropertyFormWrapper"

import FileUploadButton from "@/components/layout/buttons/FileUploadButton"

import TreasureItemForm from "./TreasureItemForm"


import EditorPropertyMixin from "../../mixins/editor-property-mixin"
import PreventNavigationMixin from "../../mixins/prevent-navigation-mixin"

let treasure = new Treasure();
export default {
    mixins: [EditorPropertyMixin, PreventNavigationMixin],
    components: {
        List,
        LabeledInputContainer,
        LoadingSpinner,
        Locale,
        LocationInput,
        TreasureItemForm,
        PropertyFormWrapper,
        FormList,
        FileUploadButton,
    },
    data() {
        return {
            importing: false,
            error: "",
            name: "Test",
            location: { coordinates: [0, 0], type: "point" },
            items: []
        }
    },
    watch: {
        name: {
            handler: function () { this.prevent_navigation_mixin_setDirty() },
        },
        items: {
            handler: function () { this.prevent_navigation_mixin_setDirty() },
            deep: true
        },
        location: {
            handler: function () { this.prevent_navigation_mixin_setDirty() },
            deep: true
        }
    },
    methods: {
        addItem() {
            const item = new TreasureItem().forInput()
            this.items.push(item)
        },
        importItems() {

        },
        async loadProperty() {
            this.editor_property_load = true
            try {
                treasure = await new Treasure().get(this.editor_property_id)
                this.name = treasure.name
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

            const treasure = new Treasure({
                name: this.name,
                location: location,
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
$template-columns: 50px 80px repeat(4, 1fr) 50px 32px;

.treasure-form {
    .treasure-item-form {
        display: grid;
        grid-template-columns: $template-columns;
    }

    .list-container>* {
        &:not(header) {
            margin-bottom: 0;
        }

        &:not(:last-child) {
            border-bottom: none;
        }
    }



    header {
        display: grid;
        position: sticky;
        top: 0;
        grid-template-columns: $template-columns;
        font-weight: bold;
        padding: 2px .5em;
        align-items: center;
        gap: .5em;
    }

    .tools {
        display: flex;
        justify-content: flex-end;
    }
}
</style>