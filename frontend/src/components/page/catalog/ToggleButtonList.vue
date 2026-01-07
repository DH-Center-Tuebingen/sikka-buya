<template>
    <span class="toggle-button-list">
        <slot name="before" />
        <ButtonVue
            v-for="toggleButton of list"
            :key="toggleButton[textProperty]"
            class="year-grid"
            :class="{ active: isActive(toggleButton[idProperty]) }"
            @click="activeChanged(toggleButton[idProperty])"
        >
            {{ toggleButton[textProperty] }}
        </ButtonVue>
        <slot name="after" />
    </span>
</template>

<script>
import ButtonVue from '../../layout/buttons/Button.vue';
export default {
    components: {
        ButtonVue,
    },
    props: {
        textProperty: {
            type: String,
            default: 'name',
        },
        idProperty: {
            type: String,
            default: 'id',
        },
        list: { type: Array, required: true },
        active: { type: Object, required: false },
    },
    methods: {
        isActive(id) {
            return Boolean(this.active?.[id]);
        },
        activeChanged(id) {
            this.$emit('change', id);
        },
    },
};
</script>

<style lang="scss" scoped>
button {
    display: inline-block;
}
</style>