<template>
    <div class="catalog-filters">
        <template v-for="input of filteredInput">
            <LabeledInputContainer
                v-if="input.type === 'text'"
                :key="`${input.name}-text`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="input-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <input
                    v-model="filters[input.name]"
                    :disabled="input.disabled"
                    type="text"
                >
            </LabeledInputContainer>

            <LabeledInputContainer
                v-else-if="input.type === 'inline-checkbox'"
                :key="`${input.name}-inline-checkbox`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="inline-checkbox-wrapper"
            >
                <template #label>
                    <input
                        v-model="filters[input.name]"
                        type="checkbox"
                        style="margin-right: 10px;"
                        :disabled="input.disabled"
                    >
                    <locale :path="input.label" />
                </template>
            </LabeledInputContainer>

            <!-- NUMBER -->
            <LabeledInputContainer
                v-else-if="input.type === 'number'"
                :key="`${input.name}-number`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="input-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <input
                    v-model="filters[input.name]"
                    :disabled="input.disabled"
                    type="number"
                >
            </LabeledInputContainer>

            <!-- NUMBER -->
            <LabeledInputContainer
                v-else-if="input.type === 'range'"
                :key="`${input.name}-range`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="input-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>

                <RangeInput
                    v-model="filters[input.name]"
                    :disabled="input.disabled"
                />
            </LabeledInputContainer>

            <LabeledInputContainer
                v-else-if="input.type === 'button-group'"
                :key="`${input.name}-button-group`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="input-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <RadioButtonGroup
                    :id="input.name"
                    v-model="filters[input.name]"
                    :disabled="input.disabled"
                    :tlabels="input.labels"
                    :options="input.options"
                    :unselectable="true"
                />
            </LabeledInputContainer>

            <LabeledInputContainer
                v-else-if="input.type === 'three-way'"
                :key="`${input.name}-three-way`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="input-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <ThreeWayToggle
                    v-model="filters[input.name]"
                    :disabled="input.disabled"
                    :invert="input.invert"
                    :true-label="input.trueLabel"
                    :false-label="input.falseLabel"
                    :null-label="input.nullLabel"
                    :overwrite-no-class="input.overwriteNoClass"
                    :overwrite-yes-class="input.overwriteYesClass"
                />
            </LabeledInputContainer>

            <LabeledInputContainer
                v-else-if="input.type === 'single-select'"
                :key="`${input.name}-single-select`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="single-select-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <MultiDataSelectString
                    v-model="filters[searchVariableName(input.name)]"
                    :active="filters[input.name]"
                    :additional-parameters="input.additionalParameters"
                    :allow-mode-change="input.allowModeChange"
                    :attribute="input.attribute"
                    :disabled="input.disabled"
                    :disable-remove-button="true"
                    :display-text-callback="input.displayTextCallback"
                    :mode="filterMode[input.name]"
                    :query-command="input.queryCommand"
                    :query-body="input.queryBody"
                    :table="input.name"
                    :text="input.text"
                    @select="(el) => selectFilter(input.name, el)"
                    @remove="(el, index) => removeFilterItem(input.name, el, index)"
                    @change-mode="() => dataSelectToggled(input)"
                    @dynamic-change="() => $emit('dynamic-change')"
                />
            </LabeledInputContainer>

            <LabeledInputContainer
                v-else-if="input.type === 'multi-select'"
                :key="`${input.name}-multi-select`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="multi-select-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <MultiDataSelect
                    v-model="filters[searchVariableName(input.name)]"
                    :active="filters[input.name]"
                    :additional-parameters="input.additionalParameters"
                    :allow-mode-change="input.allowModeChange"
                    :attribute="input.attribute"
                    :disabled="input.disabled"
                    :disable-remove-button="true"
                    :display-text-callback="input.displayTextCallback"
                    :mode="filterMode[input.name]"
                    :query-command="input.queryCommand"
                    :query-body="input.queryBody"
                    :table="input.name"
                    :text="input.text"
                    @select="(el) => selectFilter(input.name, el)"
                    @remove="(el, index) => removeFilterItem(input.name, el, index)"
                    @change-mode="() => dataSelectToggled(input)"
                    @dynamic-change="() => $emit('dynamic-change')"
                />
            </LabeledInputContainer>
            <LabeledInputContainer
                v-else-if="input.type === 'multi-select-2d'"
                :key="`${input.name}-multi-select-2d`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="multi-select-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <multi-data-select-2-d
                    :active="filters[input.name]"
                    :input="input"
                    :disabled="input.disabled"
                    :mode="filterMode[input.name]"
                    @add="() => addToFilterList(input.name)"
                    @select="(value, idx) => selectFilter(input.name, value, idx)"
                    @remove="(el, idx) => removeFilterItem(input.name, el, idx)"
                    @dynamic-change="() => $emit('dynamic-change')"
                    @remove-group="(idx) => removeFilterItemGroup(input.name, idx)"
                    @change-mode="() => dataSelectToggled(input)"
                />
            </LabeledInputContainer>
            <LabeledInputContainer
                v-else-if="input.type === 'real-range'"
                :key="`${input.name}-real-range`"
                :style="getStyle(input)"
                :class="[input.name]"
                class="real-range-wrapper"
            >
                <template #label>
                    <locale :path="input.label" />
                </template>
                <RangeSlider
                    v-model="filters[input.name]"
                    :disabled="input.disabled"
                    :min="input.min"
                    :max="input.max"
                    :step="input.step"
                />
            </LabeledInputContainer>
            <ErrorBox
                v-else
                :key="input.name"
                :message="`${input.name} - Unbekannter Eingabetyp '${input.type}': EingabeFeld kann nicht angezeigt werden!`"
            />
        </template>
    </div>
</template>

<script>
import Query from '../../../database/query';
import ErrorBox from '../system/ErrorBox.vue';
import Filter, { FilterList } from '../../../models/Filter';
import LabeledInputContainer from '../../LabeledInputContainer.vue';
import Locale from '../../cms/Locale.vue';
import Mode from '../../../models/Mode';

import MultiDataSelect from '../../forms/MultiDataSelect.vue';
import MultiDataSelect2D from '../../forms/MultiDataSelect2D.vue';
import RadioButtonGroup from '../../forms/RadioButtonGroup.vue';
import ThreeWayToggle from '../../forms/ThreeWayToggle.vue';
import RangeInput from '../../forms/RangeInput.vue';
import RangeSlider from '../../forms/RangeSlider.vue';

import { FilterType } from '../../../config/catalog_filter';
import StringUtils from '../../../utils/StringUtils';
import URLParams from '../../../utils/URLParams';
import { snakeCase } from 'change-case';

import { cloneDeep } from 'lodash';
import MultiDataSelectString from '../../forms/MultiDataSelectString.vue';
import StringFilter from '../../../models/StringFilter';

export default {
    components: {
        MultiDataSelect,
        LabeledInputContainer,
        ThreeWayToggle,
        RadioButtonGroup,
        ErrorBox,
        MultiDataSelect2D,
        Locale,
        RangeInput,
        RangeSlider,
        MultiDataSelectString,
    },
    mixins: [Mode.mixin()],
    props: {
        initData: Object,
        overwriteOrder: {
            type: Object,
            default: () => ({}),
        },
        constantFilters: Object,
        overwriteFilters: Object,
        exclude: {
            type: Array,
            default: () => [],
        },
        filterConfig: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            unorderedInputs: [],
            filters: {},
            filterMode: {},
            filterNameMap: {},
            watching: true,
        };
    },
    computed: {
        activeFilters() {
            return Object.entries(this.filters)
                .filter(([name, val]) => {
                    if (name.startsWith(Filter.searchPrefix)) return false;

                    if (val === null) return false;
                    if (typeof val === 'object') {
                        if (Array.isArray(val)) {
                            if (val.length === 0) return false;
                            else if (
                                val.every((el) => Array.isArray(el) && el.length === 0)
                            ) {
                                return false;
                            }
                        } else {
                            if ('id' in val) return val.id !== null;
                            return Object.keys(val).length > 0;
                        }
                    } else {
                        switch (typeof val) {
                            case 'string':
                                return val !== '';
                        }
                    }

                    return true;
                })
                .reduce((obj, [name, val]) => {
                    obj[name] = val;
                    return obj;
                }, {});
        },
        inputs() {
            return this.unorderedInputs.slice().sort((a, b) => {
                let A = this.overwriteOrder[a.name] ? this.overwriteOrder[a.name] : a.order;
                let B = this.overwriteOrder[b.name] ? this.overwriteOrder[b.name] : b.order;
                if (A == null) return 1;
                else if (B == null) return -1;
                else return A - B;
            });
        },
        filteredInput() {
            return this.inputs.filter(
                (item) => this.exclude.indexOf(item.name) === -1
            );
        },
        getTextFilters() {
            return this.getFiltersFor(FilterType.text);
        },
        getNumberFilters() {
            return this.getFiltersFor(FilterType.number);
        },
        getInlineCheckboxFilters() {
            return this.getFiltersFor(FilterType.inlineCheckbox);
        },
        getButtonGroupFilters() {
            return this.getFiltersFor(FilterType.buttonGroup);
        },
        getThreeWayFilters() {
            return this.getFiltersFor(FilterType.threeWay);
        },
        getRangeFilters() {
            return this.getFiltersFor(FilterType.range);
        },
        multiSelectStringFilters() {
            return this.excludeItem(this.getMultiSelectStringFilters);
        },
        multiSelectFilters() {
            return this.excludeItem(this.getMultiSelectFilters);
        },
        multiSelectFilters2D() {
            return this.excludeItem(this.getMultiSelectFilters2D);
        },
        getMultiSelectStringFilters() {
            return this.getFiltersFor('single-select');
        },
        getMultiSelectFilters() {
            return this.getFiltersFor(FilterType.multiSelect);
        },
        getMultiSelectFilters2D() {
            return this.getFiltersFor(FilterType.multiSelect2D);
        },
        storageString() {
            return JSON.stringify(this.getStorage());
        },
    },
    watch: {
        filters: {
            handler() {
                if (this.watching) {
                    this.emitFilterChange();
                }
            },
            deep: true,
        },
        overwriteFilters: {
            handler() {
                if (this.watching) {
                    this.emitFilterChange();
                }
            },
            deep: true,
        },
    },
    mounted() {
        this.initFilters();
        if (this.initData) {
            const reload = [];
            const initFilterMode = {};

            this.getMultiSelectStringFilters.forEach((input) => {
                if (this.initData[input.name]) {
                    input.mode = input.allowModeChange ? this.initData[input.name].mode || input.mode : input.mode;
                    initFilterMode[input.name] = input.mode;
                    this.initData[input.name] = this.initData[input.name].value || [];
                }
            })

            this.getMultiSelectFilters.forEach((input) => {
                if (this.initData[input.name]) {
                    input.mode = input.allowModeChange ? this.initData[input.name].mode || input.mode : input.mode;
                    initFilterMode[input.name] = input.mode;
                    this.initData[input.name] = this.initData[input.name].value || [];

                    this.initData[input.name].forEach((item) => {
                        if (item.id !== undefined && item?.name.startsWith('...')) {
                            reload.push({ id: item.id, category: input.name, type: FilterType.multiSelect });
                        }
                    });
                }
            });
            this.getMultiSelectFilters2D.forEach((input) => {
                if (this.initData[input.name]) {
                    input.mode = this.initData[input.name].mode || input.mode;
                    initFilterMode[input.name] = input.mode;
                    this.initData[input.name] = this.initData[input.name].value || [[]];
                    this.initData[input.name].forEach((arr, arrayIndex) => {
                        arr.forEach((item) => {
                            if (item.id !== undefined && item.name.startsWith('...')) {
                                reload.push({ id: item.id, category: input.name, type: FilterType.multiSelect2D, arrayIndex });
                            }
                        });
                    });
                }
            });
            this.filterMode = Object.assign({}, this.filterMode, initFilterMode);
            this.filters = Object.assign({}, this.filters, this.initData);
            this.reloadFilterNamesIfNecessary(reload);
        }

        this.emitFilterChange();
    },
    methods: {
        emitFilterChange() {
            this.$emit('filters-change', {
                filters: this.getFilters(),
                activeFilters: this.activeFilters,
                storage: this.getStorage(),
            });
        },
        getStyle(input) {
            let style = {};
            if (input.span) {
                style['grid-column'] = `span ${input.span}`;
            }
            return style;
        },
        initFilters() {
            const filters = this.filterConfig;
            let filterData = {};
            let filterMethods = {};

            this.getRegularFilters().forEach((item) => {
                filterData = Object.assign(filterData, {
                    [item.name]: item.defaultValue == null ? null : item.defaultValue,
                });
            });

            let filterMode = {};

            this.getMultiSelectStringFilters.forEach((item) => {
                const filter = new StringFilter(item.name);
                filterData = Object.assign(filterData, filter.mapData(item.defaultValue));
                filterMethods = Object.assign(filterMethods, filter.mapMethods());
                filterMode[item.name] = item.mode ? item.mode : Mode.And;
                item.filter = filter;
            });

            this.getMultiSelectFilters.forEach((item) => {
                const filter = new Filter(item.name);
                filterData = Object.assign(filterData, filter.mapData(item.defaultValue));
                filterMethods = Object.assign(filterMethods, filter.mapMethods());
                filterMode[item.name] = item.mode ? item.mode : Mode.And;
                item.filter = filter;
            });

            this.getMultiSelectFilters2D.forEach((item) => {
                const filter = new FilterList(item.name);
                filterData = Object.assign(filterData, filter.mapData([[]]));
                filterMethods = Object.assign(filterMethods, filter.mapMethods());
                filterMode[item.name] = item.mode ? item.mode : Mode.And;
                item.filter = filter;
            });

            this.unorderedInputs = Object.values(filters).flat();

            this.filters = filterData;
            this.filterMode = filterMode;

            Object.assign(this, filterMethods);

            const filterConfigFlat = Object.values(filters).flat();
            this.filterNameMap = Object.values(filterConfigFlat).reduce((acc, filter) => {
                acc[filter.name] = filter;
                return acc;
            }, {});
        },
        setFilter(key, val) {
            this.filters[key] = val;
        },
        dataSelectToggled(input) {
            this.filterMode[input.name] = Mode.toggle(this.filterMode[input.name]);
        },
        getURLParams() {
            let options = {};
            const configMap = this.filterNameMap;
            for (const [key, value] of Object.entries(this.activeFilters)) {
                const uriKey = snakeCase(key);

                if (configMap[key].type === FilterType.multiSelect) {
                    options[uriKey] = URLParams.toMultiSelect(value, this.filterMode[key]);
                } else if (configMap[key].type === FilterType.multiSelect2D) {
                    options[uriKey] = URLParams.toMultiSelect2D(value, this.filterMode[key]);
                } else {
                    options[uriKey] = value;
                }
            }
            return options;
        },
        getFiltersFor(type) {
            return this.filterConfig[type] ?? [];
        },
        getRegularFilters() {
            return [
                ...this.getTextFilters,
                ...this.getThreeWayFilters,
                ...this.getButtonGroupFilters,
                ...this.getNumberFilters,
                ...this.getInlineCheckboxFilters,
                ...this.getRangeFilters,
            ]
        },
        reloadFilterNamesIfNecessary(reload = []) {
            if (reload.length > 0)
                Query.raw(
                    `{
        ${reload.map(({ id, category }) => {

                        let queryName = StringUtils.capitalize(category);
                        let queryBody = '{id name}';

                        if (category === 'otherPerson') {
                            queryName = 'Person';
                            queryBody = '{id name:shortName}';

                        }

                        return `${category}_${id}:get${queryName} (id: ${id}) ${queryBody}`;
                    })}
      }`, {}, true).then((result) => {
                        const obj = result.data.data;

                        const filterObjs = reload.reduce((acc, { id, category, type, arrayIndex } = {}) => {

                            const item = obj[`${category}_${id}`];
                            item.id = parseInt(item.id);
                            if (!acc[category]) acc[category] = [];
                            item.idx = acc[category].length;

                            switch (type) {
                                case FilterType.multiSelect: {
                                    acc[category].push(item);
                                    break;
                                }
                                case FilterType.multiSelect2D: {
                                    while (acc[category].length <= arrayIndex) {
                                        acc[category].push([]);
                                    }
                                    acc[category][arrayIndex].push(item);
                                    break;
                                }
                                default:
                                    throw new Error(`Type not implemented for reloading names ${type}`);
                            }
                            return acc;
                        }, {});


                        for (let [category, filterObj] of Object.entries(filterObjs)) {
                            this.$set(this.filters, category, filterObj);
                        }
                    }
                    );
        },
        getFilters() {

            const filters = Object.assign(
                {},
                this.activeFilters,
                this.constantFilters,
                this.overwriteFilters,
            );

            this.multiSelectStringFilters.forEach(({ name }) => {
                if (filters[name]) {
                    let filterMode = this.filterMode?.[name] ? this.filterMode[name].toLowerCase() : 'and';

                    if (filterMode === 'and') {
                        filters[name + '_and'] = filters[name];
                        delete filters[name];
                    } else {
                        filters[name] = filters[name];
                    }
                }
            });

            this.multiSelectFilters.forEach(({ name }) => {
                if (filters[name]) {
                    let filterMode = this.filterMode?.[name] ? this.filterMode[name].toLowerCase() : 'and';

                    if (filterMode === 'and') {
                        filters[name + '_and'] = filters[name].map((el) => el.id);
                        delete filters[name];
                    } else {
                        filters[name] = filters[name].map((el) => el.id);
                    }
                }
            });

            this.multiSelectFilters2D.forEach(({ name }) => {
                if (filters[name]) {
                    if (this.filterMode?.[name].toLowerCase() === 'and') {
                        filters[name + '_or_and'] = filters[name].map((arr) =>
                            arr.map((el) => el.id)
                        );
                    } else {
                        filters[name + '_and_or'] = filters[name].map((arr) =>
                            arr.map((el) => el.id)
                        );
                    }

                    delete filters[name];
                }
            });


            return filters;
        },
        resetFilters() {
            this.getRegularFilters().forEach((item) => {
                this.resetFilter(item.name);
            });

            [...this.getMultiSelectFilters, ...this.getMultiSelectStringFilters].forEach((filter) => {
                const emptyObj = cloneDeep(Filter.mapData(filter.name, filter.defaultValue));
                for (let [key, val] of Object.entries(emptyObj)) {

                    this.$set(this.filters, key, val);
                    const mode = filter?.mode || Mode.And;
                    this.$set(this.filterMode, key, mode);
                }
            });

            [...this.getMultiSelectFilters2D].forEach((filter) => {
                const emptyObj = cloneDeep(FilterList.mapData(filter.name, filter.defaultValue));
                for (let [key, val] of Object.entries(emptyObj)) {
                    this.$set(this.filters, key, val);
                    this.$set(this.filterMode, key, filter?.mode || Mode.And);
                }
            });
        },
        setFilters(options) {
            this.getRegularFilters().forEach((item) => {
                if (options[item.name] !== undefined) {
                    this.$set(this.filters, item.name, options[item.name]);
                }
            });

            [
                ...this.getMultiSelectStringFilters,
                ...this.getMultiSelectFilters,
                ...this.getMultiSelectFilters2D,
            ].forEach((filter) => {
                if (options[filter.name] !== undefined) {
                    this.$set(this.filters, filter.name, options[filter.name].value);
                    this.$set(this.filterMode, filter.name, options[filter.name].mode);
                }
            });
        },
        _getMethodFromFilter(methodName, inputName, idx = null) {
            const filterClass = idx == null ? Filter : FilterList;
            return filterClass[methodName](inputName);
        },
        selectFilter(name, target, idx = null) {
            const methodName = this._getMethodFromFilter(
                'selectMethodName',
                name,
                idx
            );
            return this[methodName](target, idx);
        },
        resetFilter(name) {
            let item = this.filterNameMap[name];
            if (!item) console.error(`Filter ${name} not found`);
            else {
                const active = this.activeFilters[name];
                if (active !== undefined)
                    this.$set(this.filters, name, item.defaultValue || null);
            }

        },
        removeFilterItem(name, target, index) {
            const methodName = this._getMethodFromFilter(
                'removeMethodName',
                name,
                index
            );
            return this[methodName](target, index);
        },
        removeFilterItemGroup(name, idx) {
            this.filters[name].splice(idx, 1);
        },
        addToFilterList(name) {
            const methodName = FilterList.pushMethodName(name);
            return this[methodName]();
        },
        searchVariableName(value) {
            return Filter.searchVariableName(value);
        },
        stopWatching() {
            if (this.watching === false)
                console.warn("You try to stop, but it's already stopped");
            this.watching = false;
        },
        resumeWatching() {
            if (this.watching === true)
                console.warn('You try to resume, but its not stopped');

            this.watching = true;
            this.emitFilterChange();
        },
        excludeItem(group) {
            return group.filter((item) => this.exclude.indexOf(item.name) === -1);
        },
        getStorage() {
            let storage = {};
            let activeFilters = this.activeFilters;
            this.getRegularFilters().forEach(({ name }) => {
                if (activeFilters[name] != null) {
                    storage[name] = activeFilters[name];
                }
            });
            this.getMultiSelectStringFilters.forEach((filter) => {
                storage[filter.name] = {
                    mode: this.filterMode[filter.name] || Mode.And,
                    value: activeFilters[filter.name] || [],
                };
            })

            this.getMultiSelectFilters.forEach(
                (filter) => {
                    storage[filter.name] = {
                        mode: this.filterMode[filter.name] || Mode.And,
                        value: activeFilters[filter.name] || [],
                    };
                }
            );

            this.getMultiSelectFilters2D.forEach(
                (filter) => {
                    storage[filter.name] = {
                        mode: this.filterMode[filter.name] || Mode.And,
                        value: activeFilters[filter.name] || [[]],
                    };
                }
            );

            return storage;
        },
    },
};
</script>

<style lang="scss">
.catalog-filters {
    .three-way-toggle {
        min-height: 22px;
    }
}
</style>

<style
    lang="scss"
    scoped
>
.catalog-filters {
    display: grid;
    gap: $padding;
    grid-template-columns: repeat(6, 1fr);
}

.input-wrapper {
    grid-column: span 3;
}

.multi-select-wrapper {
    grid-column: span 6;
}

.inline-checkbox-wrapper {
    grid-column: span 6;
}
</style>
