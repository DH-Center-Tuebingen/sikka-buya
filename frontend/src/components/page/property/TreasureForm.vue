<template>
    <div class="treasure-form">
        <h1>
            <Locale path="property.treasure" />
        </h1>
        <loading-spinner v-if="editor_property_load" />
        <form
            @submit.prevent
            v-else
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
                <form-list>
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
        </form>
    </div>
</template>

<script>
import Locale from '@/components/cms/Locale';
import EditorPropertyMixin from "../../mixins/editor-property-mixin"
import LabeledInputContainer from "@/components/LabeledInputContainer"
import { Treasure, TreasureItem } from '../../../models/property/treasure';
import LocationInput from "@/components/forms/LocationInput"
import LoadingSpinner from "@/components/misc/LoadingSpinner"
import List from "@/components/layout/List"
import FormList from "@/components/forms/FormList"


import TreasureItemForm from "./TreasureItemForm"

let treasure = new Treasure();
export default {
    mixins: [EditorPropertyMixin],
    components: {
        List,
        LabeledInputContainer,
        LoadingSpinner,
        Locale,
        LocationInput,
        TreasureItemForm,
        FormList,
    },
    data() {
        return {
            name: "Test",
            location: { coordinates: [0, 0], type: "point" },
            items: [
                new TreasureItem({
                    id: 0,
                    count: 1,
                    projectId: null,
                    dynasty: { id: 1, name: "Buyiden" },
                    mint: { id: 15, name: "Aidag" },
                    year: 1,
                    nominal: { id: 1, name: "Dirham" },
                    material: { id: 1, name: "Gold" },
                    fragment: false
                })
            ]
        }
    },
    methods() {

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