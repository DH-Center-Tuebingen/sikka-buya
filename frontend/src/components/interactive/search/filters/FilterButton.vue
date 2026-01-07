<template>
    <ButtonVue class="filter-button">
        <slot />
        <icon
            type="mdi"
            :path="icons.close"
            :size="14"
        />
    </ButtonVue>
</template>

<script>
import { mdiClose } from '@mdi/js';
import ButtonVue from '../../../layout/buttons/Button.vue';
import icons from '../../../mixins/icon-mixin.js';

export default {
    components: { ButtonVue },
    mixins: [icons({ close: mdiClose })],
};
</script>

<style lang='scss' scoped>
.filter-button {
    color: $primary-color;

    font-size: .8rem;
    font-weight: 600;
    padding: .25em .5em;
    border-radius: 1em;
    border: 1px solid $primary-color;
}

svg {
    margin-left: .5em;
}</style>