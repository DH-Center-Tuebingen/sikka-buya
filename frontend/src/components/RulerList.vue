<template>
    <div class="ruler-list">
        <MultiSelectList v-if="!group">
            <RulerListSection
                v-if="Array.isArray(selectedUnavailable) && selectedUnavailable.length > 0"
                :items="selectedUnavailable"
                :selected-ids="selectedIds"
                :styler="unavailableSelectedStyler"
                @selection-changed="(item) => checkboxSelected(item)"
            />
            <RulerListSection
                :items="items"
                :selected-ids="selectedIds"
                :styler="availableStyler"
                @selection-changed="(item) => checkboxSelected(item)"
            />
            <RulerListSection
                :items="unavailable"
                :selected-ids="selectedIds"
                :styler="unavailableSelectedStyler"
                @selection-changed="(item) => checkboxSelected(item)"
            />
        </MultiSelectList>
        <MultiSelectList v-else>
            <collapsible
                v-for="subgroup of groups"
                :key="subgroup.key"
                :collapsed="isCollapsed(subgroup.key)"
                @toggled="(collapsed) => toggleCollapsible(subgroup.key, collapsed)"
            >
                <template #header>
                    <selectable-list-header
                        :all-selected="allSelected(subgroup)"
                        :none-selected="noneSelected(subgroup)"
                        :selected="selectedItemsInGroup(subgroup).length"
                        :total="subgroup.items.length"
                        @select-all="selectAllInGroup(subgroup)"
                        @unselect-all="removeAllFromGroup(subgroup)"
                    >
                        {{ subgroup.label }}

                        <span
                            v-if="$store.state.debug"
                            class="debug"
                        >({{ subgroup.key }})</span>
                    </selectable-list-header>
                </template>
                <RulerListSection
                    :unavailable="selectedUnavailable"
                    :items="sorted(subgroup.items)"
                    :selected-ids="selectedIds"
                    :styler="availableStyler"
                    @selection-changed="checkboxSelected"
                />
            </collapsible>
        </MultiSelectList>
    </div>
</template>

<script>
import MultiSelectList from './MultiSelectList.vue';
import MultiSelectListMixin from './mixins/multi-select-list.js';

import CollapsibleListMixin from './mixins/collapsible-list.js';

import Person from '../utils/Person';
import RulerListSection from './RulerListSection.vue';
import Collapsible from './layout/Collapsible.vue';
import Sort from '../utils/Sorter';
import SelectableListHeader from './list/SelectableListHeader.vue';

export default {
    components: {
        MultiSelectList,
        RulerListSection,
        Collapsible,
        SelectableListHeader,
    },
    mixins: [
        MultiSelectListMixin,
        CollapsibleListMixin
    ],
    props: {
        group: {
            default: false,
            type: Boolean
        },
        selectedUnavailable: {
            type: Array,
            validator: (items) => {
                return items.every((item) => item && item.hasOwnProperty('id'));
            },
        },
        unavailable: {
            type: Array,
            validator: (items) => {
                return items.every((item) => item && item.hasOwnProperty('id'));
            },
        },
    },
    computed: {
        groups() {
            let groups = Object.values(
                this.items.reduce((prev, curr) => {
                    let { id: key, name: label } = curr.dynasty;

                    if (prev[key]) {
                        prev[key].items.push(curr);
                    } else {
                        prev[key] = { key, label, items: [curr] };
                    }
                    return prev;
                }, {})
            ).sort(function (a, b) {
                const toBack = ['?'];
                const toFront = ['Būyide'];

                a = a.label;
                b = b.label;

                if (
                    (toFront.indexOf(a) !== -1 && toFront.indexOf(b) === -1) ||
                    (toBack.indexOf(a) === -1 && toBack.indexOf(b) !== -1)
                ) {
                    return -1;
                } else if (
                    (toBack.indexOf(a) !== -1 && toBack.indexOf(b) === -1) ||
                    (toFront.indexOf(a) === -1 && toFront.indexOf(b) !== -1)
                ) {
                    return 1;
                } else return Sort.stringAlphabetically(a, b);
            });

            groups.forEach((group) =>
                group.items.sort(Sort.stringPropAlphabetically('shortName'))
            );

            return groups;
        },
    },
    methods: {
        sorted(items) {
            items.sort((a, b) => {
                let nameA = Person.getName(a);
                let nameB = Person.getName(b);

                return Sort.stringAlphabetically()(nameA, nameB);
            });
            return items;
        },
        getRulerName(ruler) {
            return Person.getName(ruler);
        },
        availableStyler(item) {
            return { color: item.color };
        },
        unavailableSelectedStyler(item) {
            const baseStyle = this.availableStyler(item);
            baseStyle.opacity = 0.5;
            return baseStyle;
        },
    },
};
</script>

<style lang="scss">
.ruler-list {
    li {
        border: none;
        border-radius: 0;
        padding-left: 5px;


    }

    .select-list-item .row {
        display: grid;
        grid-template-columns: 14px 30px 1fr;
        gap: .1rem
    }

    .MultiSelectList .select-list-item {
        grid-template-columns: auto 30px 1fr;
    }

    span {
        color: $black;
    }

    // .color-indicator {
    //   $size: 1em;
    //   width: math.div($size, 3);
    //   height: $size;
    //   border-radius: $border-radius;
    //   border: 3px solid currentColor;
    //   background-color: currentColor;
    //   margin-right: 5px;
    // }
}
</style>
