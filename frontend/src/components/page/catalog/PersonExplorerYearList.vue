<template>
    <div
        v-if="list.length > 0"
        class="person-explorer-year-list"
    >
        <h6>Prägejahr(e)</h6>
        <p
            v-if="list.length == 0"
            class="error"
        >
            Keine Typen mit dieser Person vorhanden
        </p>
        <div class="flex">
            <ButtonVue
                v-for="yearObject of list"
                :key="'year-' + person.id + '-' + yearObject.value"
                class="year-grid"
                :class="{ active: isActive(yearObject.value) }"
                @click="activeChanged(yearObject.value)"
            >
                {{ yearObject.value }}
            </ButtonVue>
        </div>

        <span
            v-if="!hasActive"
            class="hint"
        >Wählen Sie ein Prägejahr!</span>
    </div>
</template>

<script>

import ButtonVue from '../../layout/buttons/Button.vue';
export default {
    components: {
        ButtonVue
    },
    props: {
        loading: Boolean,
        person: { type: Object, required: true },
        list: { type: Array, required: true },
        active: { type: Object, required: true },
    },
    computed: {
        hasActive() {
            return Object.keys(this.active).length > 0;
        },
    },
    methods: {
        isActive(year) {
            return Boolean(this.active[year]);
        },
        activeChanged(year) {
            this.$emit('change', year);
        },
    },
};
</script>
