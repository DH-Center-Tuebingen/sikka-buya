<template>
    <span
        class="locale-comp"
        :class="{ editable: $store.getters.isEditableByWriter }"
    >
        <template v-if="$store.getters.isEditableByWriter">
            <LocaleIcon
                v-if="iconBefore"
                :lang="lang"
                :path="path"
            /><!--
            -->{{ $tc(path, count) }}<!--
            -->
            <LocaleIcon
                v-if="!iconBefore"
                :lang="lang"
                :path="path"
            />
        </template>
        <template v-else><!--
            -->{{ $tc(path, count) }}<!--
        --></template>
    </span>
</template>

<script>
import Button from '../layout/buttons/Button.vue';
import Toggle from '../layout/buttons/Toggle.vue';
import LocaleIcon from './LocaleIcon.vue';


export default {
    props: {
        path: {
            required: true,
            type: String
        },
        count: {
            type: Number,
            default: 1
        },
        iconBefore: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            plural: false,
        }
    },
    computed: {
        lang() {
            return this.$root.$i18n.locale
        }
    },
    components: { Button, Toggle, LocaleIcon }
};
</script>

<style lang='scss' scoped>
a.locale-link {
    position: absolute;
    color: currentColor !important;
    bottom: 1em;
    right: 0;
    transform: translateY(80%);

    // The z-index conflicts with other absolute positioned things,
    // like data-select drop-down. Would be better if we don't 
    // need it at all.
    // z-index: 1;
}

.locale-comp {
    position: relative;

    &.editable {
        padding-right: 12px;
    }
}



a {
    color: currentColor !important;
}
</style>