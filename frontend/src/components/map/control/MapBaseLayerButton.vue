<template>
    <div class="map-base-layer-button">
        <div
            v-if="selectionActive"
            class="map-selection-panel"
        >
            <BaseLayerPreviewButton
                v-for="(layer, index) in $store.state.baseLayers"
                :key="layer.name"
                :name="layer.name"
                :image="layer.image"
                :active="index === $store.state.activeBaseLayer"
                @click.native="select(index)"
            />
        </div>
        <div class="active-layer-container">
            <div
                class="x-overlay"
                :class="{ hidden: !selectionActive }"
            />

            <BaseLayerPreviewButton
                class="active-layer-button"
                :name="activeLayer.name"
                :image="activeLayer.image"
                :active="false"
                @click.native="selectionActive = !selectionActive"
            />
        </div>
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
    position: relative;
    height: 128px;
    min-width: 128px;
    background-color: $light-gray;
    border: 1px solid #ccc;
    border-radius: 4px;
    display: flex;
    gap: 3px;
}

.active-layer-button {
    background-color: white;
    pointer-events: all;
}

.map-selection-panel {
    position: absolute;
    top: 0;
    left: 0;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    z-index: 1000;
    transform: translateY(-100%);
}



.x-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: $border-radius;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.3s ease;

    &.hidden {
        opacity: 0;
    }

    
    &:before,
    &:after {
        content: '';
        width: 5px;
        height: 40px;
        background-color: white;
        z-index: 2;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%) rotate(45deg);
        pointer-events: none;
        opacity: 1;

    }


    &:after {
        transform: translateX(-50%) translateY(-50%) rotate(-45deg);
    }
}
</style>