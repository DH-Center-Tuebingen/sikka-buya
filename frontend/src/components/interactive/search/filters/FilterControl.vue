<template>
    <div
        class="filter-control"
        :class="{ active: hasFilters }"
    >
        <header class="row">
            <Icon
                :size="14"
                :path="hasFilters ? icons.filter : icons.noFilter"
                type="mdi"
            />
            <Locale :path="(hasFilters) ? 'message.listed_filters_are_active' : 'message.no_filter_active'" />
            <Button
                v-if="hasFilters"
                class="reset-filters-button"
                :style="{ marginLeft: 'auto' }"
                @click="() => $emit('resetAllFilters')"
            >
                <Icon
                    :size="14"
                    :path="icons.filterOff"
                    type="mdi"
                />{{
                    $t('message.reset_all_filters')
                }}
            </Button>
        </header>
        <div
            class="active-filter-list"
            v-if="hasFilters"
        >
            <FilterButton
                v-for="filter in activeFilters"
                :key="`active-filter-button-${filter.key}`"
                @click.native="() => $emit('resetFilter', filter.key)"
            >{{ $tc("property." + $utils.snakeCase(filter.key)) }}</FilterButton>
        </div>
    </div>
</template>

<script>
import { mdiFilter, mdiFilterOff, mdiFilterOutline } from '@mdi/js';

import FilterButton from './FilterButton.vue';
import icons from '../../../mixins/icon-mixin.js';
import Locale from '../../../cms/Locale.vue';
export default {
    mixins: [icons({ filter: mdiFilter, noFilter: mdiFilterOutline, filterOff: mdiFilterOff })],
    components: { FilterButton, Locale },
    props: {
        activeFilters: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        hasFilters() {
            return this.activeFilters.length > 0;
        },
    },

};
</script>

<style lang='scss' scoped>
.filter-control {
    border-radius: $border-radius;
    color: $light-gray;
    border: 1px solid $light-gray;

    &.active {
        color: $primary-color;
        border-color: $primary-color;
    }
}

.row {
    display: flex;
    align-items: center;
    gap: 1em;
}

.right-controls {
    display: flex;
    flex-direction: column;
    gap: 1em;
}

header {
    padding: .25em .5em;
    font-weight: bold;
    // border-bottom: 1px solid currentColor;
}

.active-filter-list {
    display: flex;
    flex-wrap: wrap;
    gap: .5em;
    padding: .5em;
}

.reset-filters-button {
    font-size: .8rem;
    background-color: transparent;
    border: 1px solid $primary-color;
    color: $primary-color;
    font-weight: 600;
    border-radius: 1em;

    svg {
        margin-right: .5em;
    }
}
</style>