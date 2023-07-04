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
            <form-list @add="addItem">
                <header>
                    <div class="count">
                        <Locale path="general.count" />
                    </div>
                    <div class="name">
                        <Locale path="general.name" />
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
    },
    data() {
        return {
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
        async loadProperty(){
            this.editor_property_load = true
            try {
                treasure = await new Treasure().get(this.editor_property_id)
                console.log(treasure)
                this.name = treasure.name
                this.location = treasure.location || { coordinates: [0, 0], type: "point" }
                this.items = treasure.items
            } catch (e) {
                let message = e
                if(e instanceof Error) message = e.message
                this.error = Array.isArray(message)? message.join("\n") : message
            }
            this.editor_property_load = false
        },
        async submit() {
            this.error = ""
            const treasure = new Treasure({
                name: this.name,
                location: this.location,
                items: this.items
            })

            try {
                console.log(this)
                if(this.editor_property_id){
                    await treasure.update(this.editor_property_id)
                }else{
                    await treasure.add()
                }
                
            } catch (e) {
                this.error = Array.isArray(e)? e.join("\n") : e
            }
        }
    }
}
</script>

<style lang="scss" scoped>
header {
    display: grid;
    grid-template-columns: 50px repeat(6, 1fr) 50px;
    border: 1px solid $light-gray;
    padding: 2px .5em;
    align-items: center;
    gap: .5em;
}
</style>