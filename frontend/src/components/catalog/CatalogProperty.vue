<template>
    <div class="catalog-property">
        <header v-if="label || $slots.label">
            <div class="simple-property-label property-label">
                <slot name="label" />{{ label }}
            </div>

            <div
                v-if="$slots.info"
                ref="popupButton"
                class="popup-container"
                @click.stop.prevent="togglePopup()"
            >
                <popup-activator>
                    <InfoIcon />
                    <template #popup>
                        <slot name="info" />
                    </template>
                </popup-activator>
            </div>
        </header>

        <!-- eslint-disable vue/no-v-html -->
        <div
            v-if="html"
            class="property-value"
            v-html="html"
        />
        <!-- eslint-enable vue/no-v-html -->
        <div
            v-else
            class="property-value"
        >
            <slot />
        </div>
    </div>
</template>

<script>
import InfoIcon from 'vue-material-design-icons/InformationOutline.vue';
import PopupActivator from '../Popup/PopupActivator.vue';

export default {
    name: 'CatalogProperty',
    components: {
        InfoIcon,
        PopupActivator,
    },
    props: {
        label: String,
        html: String,
    },
    data() {
        return {
            popupOpened: false,
        };
    },
    methods: {
        togglePopup() {
            this.popupOpened = !this.popupOpened;
        },
        closePopup() {
            this.popupOpened = false;
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
header {
    display: flex;
    align-items: center;

    margin-bottom: 1 * $padding;

    .popup-activator {
        margin-left: $padding;
    }

    .material-design-icon {
        $size: $regular-font;
        width: $size;
        height: $size;
        color: $primary-color;
        user-select: none;
    }
}

.catalog-property {
    font-size: $large-font;
    background-color: $white;
    border-radius: 3px;
    padding: 2 * $padding;
}

.property-label {
    font-size: $small-font;
    font-weight: bold;
    color: $primary-color;
    text-transform: uppercase;
}

.popup-container {
    position: relative;
}
</style>
