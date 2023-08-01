import { FilterType, filterNameMap } from "../../config/catalog_filter";
import URLParams from "../../utils/URLParams";
import { camelCase } from "change-case";


export default function (storage, urlParamsConfig) {
    return {
        created() {
            if (!this.catalog_filter_mixin_override_with_query_params()) {
                console.log("Loaded stored filter values!")
                this.catalog_filter_mixin_load()
            } else console.log("Override with query params!")
        },
        data() {
            return {
                catalog_filter_mixin_initData: {},
                catalog_filter_mixin_filterMode: {},
                catalog_filter_mixin_activeFilters: [],
                catalog_filter_mixin_filterActive: false
            }
        },
        methods: {
            // Can be overloaded in component.
            // E.g. If you want to save an additional object
            // pass it as second arg to the 'catalog_filter_mixin_save(red, obj)
            // And remove it from the data after it's loaded. 
            catalog_filter_mixin_loaded(data) {
                return;
            },
            catalog_filter_mixin_reset(catalogFilterRef) {
                catalogFilterRef.resetFilters()
            },
            catalog_filter_mixin_load() {
                try {
                    const storedFilters = localStorage.getItem(storage)
                    const loadedData = JSON.parse(storedFilters)
                    this.catalog_filter_mixin_loaded(loadedData)
                    this.catalog_filter_mixin_initData = loadedData
                } catch (e) {
                    console.warn('Could not load stored filter values!', e);
                }
            },
            catalog_filter_mixin_override_with_query_params() {
                const data = {}
                const url = new URL(window.location)
                const params = url.searchParams

                params.forEach((_, queryKey) => {
                    const objectKey = camelCase(queryKey)

                    if (filterNameMap[objectKey]) {
                        if (!data[objectKey]) {
                            switch (filterNameMap[objectKey].type) {
                                case FilterType.text:
                                    data[objectKey] = URLParams.get(queryKey, "string")
                                    break
                                case FilterType.threeWay:
                                    data[objectKey] = URLParams.get(queryKey, "bool")
                                    break
                                case FilterType.multiSelect:
                                    data[objectKey] = URLParams.getMultiSelect(queryKey)
                                    break
                                case FilterType.multiSelect2D:
                                    data[objectKey] = URLParams.getMultiSelect2D(queryKey)
                                    break
                                case FilterType.buttonGroup:
                                    data[objectKey] = URLParams.get(queryKey, "string")
                                    break
                                default:
                                    throw new Error(`Unknown filter type "${filterNameMap[queryKey].type}"!`)
                            }
                        } else {
                            console.warn(`Found two filters of type "${queryKey}"!`)
                        }

                    }
                })

                this.catalog_filter_mixin_initData = data
                return Object.keys(data).length > 0
            },
            catalog_filter_mixin_save(catalogFilterRef, obj = {}) {
                const data = Object.assign({}, catalogFilterRef.getStorage(), obj)
                localStorage.setItem(storage, JSON.stringify(data))
            },
            catalog_filter_mixin_updateActive(catalogFilterRef, excludedKeys = []) {
                const catalogFilters = Object.entries(
                    catalogFilterRef.activeFilters
                ).filter(([key]) => {
                    if (excludedKeys.indexOf(key) != -1) {
                        return false;
                    }

                    return true;
                });

                this.catalog_filter_mixin_activeFilters = catalogFilters.map(([key, value]) => ({ key, value }))
                this.catalog_filter_mixin_filterActive = catalogFilters.length > 0
            }
        }
    }
}