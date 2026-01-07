<template>
    <PopupActivator
        :target-width="280"
        :no-shadow="true"
        class="settings"
    >
        <template #default="{ active }">
            <ButtonVue
                class="map-button"
                :active="active"
                :no-stop="true"
            >
                <Icon
                    type="mdi"
                    :path="icons.mdiCog"
                    :size="iconSize"
                />
            </ButtonVue>
        </template>

        <template #popup>
            <h3>Einstellungen</h3>
            <slot />
            <ButtonVue
                class="small-button"
                @click="resetSettings"
            >
                <Icon
                    type="mdi"
                    :path="icons.mdiRestart"
                    :size="iconSize"
                />
                Standard wiederherstellen
            </ButtonVue>
        </template>
    </PopupActivator>
</template>

<script>
import ButtonVue from './layout/buttons/Button.vue';
import PopupActivator from './Popup/PopupActivator.vue';

import Icon from "./mixins/icon-mixin.js"
import { mdiCog, mdiRestart } from '@mdi/js';

export default {
    components: {
        PopupActivator,
        ButtonVue
    },
    mixins: [Icon({ mdiCog, mdiRestart })],
    props: {
        open: {
            type: Boolean,
            required: true,
        },
        iconSize: {
            type: Number,
            default: 22,
        }
    },
    methods: {
        resetSettings() {
            this.$emit('reset');
        },
        toggleSettings() {
            this.$emit('toggle');
        },
    },
};
</script>

<style lang="scss">
.settings {


    .reset-icon {
        padding-right: $padding;
    }


    .small-button {
        width: 100%;
    }

    label {
        font-size: $small-font;
    }
}
</style>