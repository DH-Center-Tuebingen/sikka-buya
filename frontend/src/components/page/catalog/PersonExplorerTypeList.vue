<template>
    <div class="type-area area">
        <h6>Typ(en)</h6>
        <div class="flex">
            <person-explorer-type-button
                v-for="type of issuerTypes"
                :key="'issuer-type-' + type.id"
                :type="type"
                :class="getClass(type)"
                :active="isActive(type)"
                @change="change"
            />
            <overlord-separator v-if="overlordTypes.length > 0" />
            <person-explorer-type-button
                v-for="type of overlordTypes"
                :key="'overlord-type-' + type.id"
                :type="type"
                :class="getClass(type)"
                :active="isActive(type)"
                @change="change"
            />
        </div>

        <span
            v-if="selected == null"
            class="hint"
        >Wählen Sie einen Typ!</span>
    </div>
</template>

<script>
import OverlordSeparator from './OverlordSeparator.vue';
import PersonExplorerTypeButton from './PersonExplorerTypeButton.vue';

export default {
    components: { OverlordSeparator, PersonExplorerTypeButton },
    props: {
        issuerTypes: {
            type: Array,
            default: () => []
        },
        overlordTypes: {
            type: Array,
            default: () => []
        },
        selected: {
            type: String,
            default: null
        }
    },
    methods: {
        isActive(type) {
            return this.selected === type.id;
        },
        getClass(type) {
            const classes = [];
            if (type.id === this.selected) classes.push = 'active';

            return classes;
        },
        change(typeId) {
            this.$emit('change', typeId);
        },
    },
};
</script>

<style></style>