<template>
    <CatalogFilterControls
        ref="catalogFilterControls"
        :init-data="initData"
        :overwrite-order="overwriteOrder"
        :constant-filters="constantFilters"
        :overwrite-filters="overwriteFilters"
        :exclude="exclude"
        :filter-config="filterConfig"
        @filters-change="onFiltersChange"
        @dynamic-change="() => $emit('dynamic-change')"
    />
</template>

<script>
import { RequestGuard } from '../../../utils/Async.mjs';
import CatalogFilterControls from './CatalogFilterControls.vue';
import PageInfo, { Pagination } from '../../../models/pageinfo';
import Type from '../../../utils/Type';

export default {
    components: {
        CatalogFilterControls,
    },
    props: {
        initData: Object,
        forceAll: Boolean,
        pageInfo: Object,
        overwriteOrder: {
            type: Object,
            default: () => ({}),
        },
        additionalQuery: {
            type: String,
        },
        typeBody: {
            type: String,
            defaultValue: 'id projectId',
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
        filterClass: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            watching: true,
            latestFilterPayload: null,
        };
    },
    computed: {
        activeFilterClass() {
            if (!this.filterClass) {
                return Type;
            } else {
                return this.filterClass;
            }
        },
        activeFilters() {
            return this.$refs.catalogFilterControls?.activeFilters || {};
        },
        storageString() {
            return JSON.stringify(this.getStorage());
        },
    },
    watch: {
        pageInfo: {
            async handler(pageInfo, oldPageInfo) {
                if (!PageInfo.equals(pageInfo, oldPageInfo)) {
                    await this.search();
                }
            },
            deep: true,
        },
    },
    created() {
        this.searchRequestGuard = new RequestGuard(this.searchCallback.bind(this), {
            before: () => {
                this.$emit('update', { types: [], pageInfo: this.pageInfo });
            },
        });
    },
    methods: {
        onFiltersChange(payload) {
            this.latestFilterPayload = payload;
            this.$emit('filters-change', payload);
            if (this.watching) {
                this.search();
            }
        },
        async searchCallback(filters) {
            this.$emit('loading', true);

            let types = [];
            let pageInfo = this.pageInfo;

            try {
                if (this.forceAll) {
                    while (
                        pageInfo.total === undefined ||
                        pageInfo.page * (pageInfo.count + 1) < pageInfo.total
                    ) {
                        let { types: nextTypes, pageInfo: nextPageInfo } =
                            await this.activeFilterClass.filteredQuery(
                                {
                                    pagination: Pagination.fromPageInfo(pageInfo),
                                    filters,
                                    typeBody: this.typeBody,
                                }
                            );

                        pageInfo = nextPageInfo;
                        pageInfo.page++;
                        types.push(...nextTypes);
                    }
                } else {
                    ({ types, pageInfo } = await this.activeFilterClass.filteredQuery(
                        {
                            pagination: Pagination.fromPageInfo(this.pageInfo),
                            filters,
                            typeBody: this.typeBody,
                        }
                    ));
                }
            } catch (e) {
                this.$emit('update', { types: [], pageInfo });
                this.$emit('error', e);
                this.$emit('loading', false);
                return;
            }

            this.$emit('update', { types, pageInfo });
            this.$emit('loading', false);
        },
        setFilter(key, val) {
            this.$refs.catalogFilterControls?.setFilter(key, val);
        },
        getURLParams() {
            return this.$refs.catalogFilterControls?.getURLParams() || {};
        },
        getFilters() {
            return this.$refs.catalogFilterControls?.getFilters() || {};
        },
        async search() {
            await this.searchRequestGuard.exec(this.getFilters());
        },
        resetFilters() {
            this.$refs.catalogFilterControls?.resetFilters();
        },
        setFilters(options) {
            this.$refs.catalogFilterControls?.setFilters(options);
        },
        resetFilter(name) {
            this.$refs.catalogFilterControls?.resetFilter(name);
        },
        stopWatching() {
            this.watching = false;
            this.$refs.catalogFilterControls?.stopWatching();
        },
        resumeWatching() {
            this.watching = true;
            this.$refs.catalogFilterControls?.resumeWatching();
        },
        getStorage() {
            return this.$refs.catalogFilterControls?.getStorage() || {};
        },
    },
};
</script>
