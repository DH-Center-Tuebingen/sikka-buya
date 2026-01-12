<template>
    <div class="map-base-layer-button">
        <template v-if="selectionActive">
            <BaseLayerPreviewButton
                v-for="(layer, index) in $store.state.baseLayers"
                :key="layer.name"
                :name="layer.name"
                :image="layer.image"
                :active="index === $store.state.activeBaseLayer"
                @click.native="select(index)"
            />
        </template>
        <BaseLayerPreviewButton
            class="active-layer-button"
            :name="activeLayer.name"
            :image="activeLayer.image"
            :active="false"
            @click.native="selectionActive = !selectionActive"
        />
    </div>
</template>

<script>
import BaseLayerPreviewButton from './BaseLayerPreviewButton.vue';

export default {
    components: {
        BaseLayerPreviewButton,
    },
    data: function () {
        return {
            selectionActive: false
        };
    },
    computed: {
        activeLayer() {
            return this.$store.getters.activeBaseLayer;
        }
    },
    methods: {
        select(index) {
            this.$store.commit('selectBaseLayer', index);
            this.selectionActive = false;
        }
    }
};
</script>

<style
    lang='scss'
    scoped
>
.map-base-layer-button {
    height: 128px;
    min-width: 128px;
    background-color: $light-gray;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 8px;
    margin-bottom: 20px;
    display: flex;
    gap: 3px;
}

.active-layer-button {
    background-color: white;
}
</style>