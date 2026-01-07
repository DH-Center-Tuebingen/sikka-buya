<template>
    <div class="catalog-filter-search">
        <h1>{{ $t('editor.expert_search') }}</h1>

        <div class="grid">
            <aside>
                <search-field
                    id="text-search"
                    v-model="text"
                />
                <catalog-filter
                    ref="catalogFilter"
                    :filter-config="filterConfig"
                    :init-data="catalog_filter_mixin_initData"
                    :page-info="pageInfo"
                    :overwrite-filters="overwriteFilters"
                    @update="updateTypes"
                />
            </aside>
            <div class="right-control">
                <FilterControl
                    name="expert"
                    :active-filters="activeFilters"
                    @resetFilter="resetFilter"
                    @resetAllFilters="resetAllFilters"
                />
                <pagination
                    class="results"
                    :page-info="pageInfo"
                    @input="updatePagination"
                >
                    <List
                        :error="error"
                        :items="types"
                    >
                        <ListItem
                            v-for="item of types"
                            :id="`list-item-type-${item.id}`"
                            :key="item.key"
                            :to="{
                                name: 'EditType',
                                params: { id: item.id },
                                target: '_blank',
                            }"
                            :class="item.completed ? 'completed' : 'incomplete'"
                        >
                            {{ item.projectId }}
                        </ListItem>
                    </List>
                </pagination>
            </div>
        </div>
    </div>
</template>

<script>
import List from '../../layout/List.vue';
import ListItem from '../../layout/ListItem.vue';
import Pagination from '../../list/Pagination.vue';
import CatalogFilter from '../catalog/CatalogFilter.vue';
import SearchField from '../../layout/SearchField.vue';
import FilterControl from '../../interactive/search/filters/FilterControl.vue';

// mixins
import CatalogFilterMixin from '../../mixins/catalog-filter';
import { useExpertFilterConfig } from '../../../config/catalog_filter';

export default {
    components: {
        CatalogFilter,
        Pagination,
        List,
        ListItem,
        SearchField,
        FilterControl
    },
    mixins: [CatalogFilterMixin('sikka-buya-expert-search-catalog-filters')],
    data() {
        return {
            text: '',
            error: null,
            types: [],
            pageInfo: { count: 50, page: 0, total: 0, last: 0 },
            filterConfig: useExpertFilterConfig(),
        };
    },
    computed: {
        hasFilters() {
            return this.activeFilters.length > 0;
        },
        activeFilters() {
            const activeFilters = this.catalog_filter_mixin_activeFilters
            if (this.text != '') {
                activeFilters.push({ key: "plain_text", value: this.text });
            }

            return activeFilters;
        },
        overwriteFilters() {
            return this.text == "" ? {} : { plain_text: this.text };
        },
    },
    methods: {
        catalog_filter_mixin_loaded(data, filterMode) {
            if (data.text) {
                this.text = data.text;
                delete data.text;
            }
        },
        updatePagination(pageInfo) {
            this.pageInfo = pageInfo;
        },
        updateTypes(args) {
            const { types, pageInfo } = args;
            this.types = types;
            this.pageInfo = pageInfo;

            this.catalog_filter_mixin_updateActive(this.$refs.catalogFilter);
            this.catalog_filter_mixin_save(this.$refs.catalogFilter, {
                text: this.text,
            });
        },
        resetAllFilters() {
            this.text = '';
            this.catalog_filter_mixin_reset(this.$refs.catalogFilter);
        },
        resetFilter(name) {
            if (name == "plain_text") {
                this.text = '';
            } else this.$refs.catalogFilter.resetFilter(name);
        }
    },
};
</script>


<style
    lang="scss"
    scoped
>
.results {
    grid-column: span 4;
}

.grid {
    grid-template-columns: repeat(6, 1fr);
}

aside {
    grid-column: span 2;
}



#text-search {
    margin-bottom: 3 * $padding;
}

p {
    max-width: 512px;
}

button {
    width: 100%;
    margin-bottom: 2 * $padding;
}

.right-control {
    display: flex;
    flex-direction: column;
    gap: .5em;

    grid-column: span 4;
}
</style>