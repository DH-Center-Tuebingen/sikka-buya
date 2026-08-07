<template>
    <div class="treasure-map ui">
        <Sidebar style="min-width: 300px !important;">
            <template #title>
                <Locale
                    path="general.filter"
                    :count="2"
                />
            </template>
            <CatalogFilterControls
                v-if="filterConfigLoaded"
                ref="catalogFilter"
                style="padding: 0 1em 1em;"
                :init-data="catalog_filter_mixin_initData"
                :filter-config="filterConfig"
                @dynamic-change="recalculateCatalogSidebar"
                @filters-change="(data) => debounceFilters(data)"
            />
        </Sidebar>

        <div class="center-ui-wrapper">
            <OttomanTreasureTable
                v-if="showTable"
                :treasure="selectedTreasures[0]"
                :filters="filters"
                @close="() => showTable = false"
            />
            <div class="center-ui-top center-ui-top-ottoman">
                <map-toolbar
                    :filters-active="filtersActive"
                    @reset-filters="resetFilters"
                />
            </div>
            <div class="center-ui-center" />

            <div class="bottom-center-ui center-ui-center">
                <ScrollView
                    v-if="selectedTreasures.length === 1"
                    :key="`list-item-description-${selectedTreasures[0].id}`"
                    class="treasure-description"
                >
                    <OttomanTreasureDescription :treasure="selectedTreasures[0]">
                        <template #header>
                            <ButtonVue
                                style="padding: 0.25em 1em;"
                                @click="() => showTable = true"
                            >
                                Table View
                            </ButtonVue>
                        </template>
                    </OttomanTreasureDescription>
                </ScrollView>
                <div v-else />

                <MapBaseLayerButton
                    v-model="selectedLayerIndex"
                    style="justify-self: flex-end;"
                />
            </div>
        </div>


        <Sidebar
            ref="catalogSidebar"
            style="grid-column: 3;"
            side="right"
        >
            <template #title>
                <Locale
                    path="property.treasure"
                    :count="2"
                />
            </template>

            <template v-if="selectedTreasures.length > 0">
                <MultiSelectList style="flex: 1;margin-bottom: 1em; border-bottom: 1px solid var(--border-color);">
                    <h4 class="sidebar-header">
                        Selected Finds
                    </h4>
                    <MultiSelectListItem
                        v-for="treasure in selectedTreasures"
                        :key="`list-item-${treasure.id}`"
                        :selected="isTreasureSelected(treasure.id)"
                        :checkbox-disabled="selectedTreasures.length > 1 && !isTreasureSelected(treasure.id)"
                        :style="getSelectedTreasureStyle(treasure)"
                        @click.native="setTreasure(treasure.id)"
                        @checkbox-selected="() => toggleTreasure(treasure.id)"
                    >
                        <template #before>
                            <ListColorIndicator
                                :color="treasure.color"
                                default-color="transparent"
                            />
                        </template>
                        {{ treasure.name }}
                    </MultiSelectListItem>
                </MultiSelectList>
            </template>


            <MultiSelectList style="flex: 1;">
                <h4
                    v-if="selectedTreasures.length > 0"
                    class="sidebar-header"
                >
                    Available Finds
                </h4>
                <div
                    v-if="activeTreasures.length === 0"
                    class="no-results"
                >
                    <p>
                        No finds found with the current filter selection. Please adjust the filters to see available
                        finds.
                    </p>
                </div>
                <MultiSelectListItem
                    v-for="treasure in activeTreasures"
                    :key="`list-item-${treasure.id}`"
                    :selected="isTreasureSelected(treasure.id)"
                    :checkbox-disabled="selectedTreasures.length > 1 && !isTreasureSelected(treasure.id)"
                    @click.native="setTreasure(treasure.id)"
                    @checkbox-selected="() => toggleTreasure(treasure.id)"
                >
                    <template #before>
                        <ListColorIndicator
                            :color="treasure.color"
                            default-color="transparent"
                        />
                    </template>
                    {{ treasure.name }}
                </MultiSelectListItem>
            </MultiSelectList>
            <template #footer>
                <div
                    class="diagram-view"
                    :class="{ hide: !(selectedTreasures.length > 0), collapsed: diagramMode === null }"
                    style="margin: 1em;margin-top: auto;"
                >
                    <div
                        class="diagram-select-bar"
                        style="margin-top: .5rem;"
                    >
                        <div
                            class="select-wrapper"
                            style="position: relative;"
                        >
                            <span
                                v-if="diagramMode === null"
                                class="diagram-select-placeholder"
                            >
                                {{ $t('label.diagram') }}
                            </span>
                            <select
                                ref="diagramSelect"
                                :value="diagramMode"
                                @input="updateDiagram"
                            >
                                <option value="person">
                                    <Locale path="property.issuer" />
                                </option>
                                <option value="material">
                                    <Locale path="property.material" />
                                </option>
                                <option value="typeOfDenomination">
                                    <Locale path="property.denomination" />
                                </option>
                                <option value="issuingStateRegion">
                                    <Locale path="property.region" />
                                </option>
                            </select>
                        </div>
                        <ButtonVue
                            :disabled="diagramMode === null"
                            @click="clearDiagram"
                        >
                            <Icon
                                type="mdi"
                                :path="icons.mdiClose"
                                :size="IconSize.Tiny"
                            />
                        </ButtonVue>
                    </div>

                    <div
                        ref="diagramContainer"
                        style="position: relative;"
                    >
                        <canvas
                            ref="diagramCanvas"
                            height="500"
                            style="position: absolute; right: 0; bottom: 0 ;"
                        />
                    </div>
                </div>
            </template>
        </Sidebar>
    </div>
</template>

<script>
import Chart from "chart.js/auto"

// Mixins
import map from '@/components/map/mixins/map';
import settingsMixin from '@/components/map/mixins/settings';
import TimelineMixin from '@/components/map/mixins/timeline';
import TimelineHighlightMixin from '@/components/mixins/timeline-highlight-mixin';
import MountedAndLoadedMixin from '@/components/mixins/mounted-and-loaded';
import CatalogFilterMixin from '@/components/mixins/catalog-filter';

//Components
import CatalogFilterControls from '@/components/page/catalog/CatalogFilterControls.vue';
import ButtonVue from '@/components/layout/buttons/Button.vue';
import Sidebar from '@/components/map/Sidebar.vue';
import Timeline from '@/components/map/timeline/Timeline.vue';
import RadioButtonGroup from '@/components/forms/RadioButtonGroup.vue';
import ScrollView from '@/components/layout/ScrollView.vue';

// Other
import OttomanTreasureOverlay from './OttomanTreasureOverlay';
import Settings from '@/settings';
import Locale from '@/components/cms/Locale.vue';
import MapToolbar from "@/components/map/MapToolbar.vue"
import MultiSelectList from '@/components/MultiSelectList.vue';
import MultiSelectListItem from '@/components/MultiSelectListItem.vue';
import { FrequencySampler } from "@/models/chart/sampler"

let settings = new Settings(window, 'TreasureOverlay');
const overlaySettings = settings.load();


import LocaleStorageMixin from "@/components/mixins/local-storage-mixin"
import Sort from "@/utils/Sorter";
import TimelineChart, { BarGraph, MirrorGraph, RangeGraph, TickGraph, LineGraph } from "@/models/timeline/TimelineChart";
import ListColorIndicator from '@/components/list/ListColorIndicator.vue';
import Query from "@/database/query";

import Range from "@/models/timeline/range";
import Color from "@/utils/Color";
import Row from '@/components/layout/Row.vue';
import { fixPrecision } from "@/utils/Number"


import IconMixin from '@/components/mixins/icon-mixin';
import { mdiClose } from '@mdi/js';
import { IconSize } from "@/config";

import { ottomanFilterConfig } from './ottoman-filter'
import MapBaseLayerButton from "../map/control/MapBaseLayerButton.vue";
import OttomanTreasureDescription from "./OttomanTreasureDescription.vue";
import OttomanTreasureTable from "./OttomanTreasureTable.vue";
import { debounce } from "lodash";

export default {
    components: {
        ButtonVue,
        CatalogFilterControls,
        ListColorIndicator,
        Locale,
        MapToolbar,
        MapBaseLayerButton,
        MultiSelectList,
        MultiSelectListItem,
        Sidebar,
        ScrollView,
        OttomanTreasureDescription,
        OttomanTreasureTable,
    },
    mixins: [
        map,

        settingsMixin(overlaySettings),
        LocaleStorageMixin("treasure-map", [
            "selectedTreasureIds",
            "selectedMintIds",
            "chartType",
            "diagramMode",
        ]),
        MountedAndLoadedMixin(['storage', 'data']),
        IconMixin({
            mdiClose,
        }),
        CatalogFilterMixin('ottoman_treasure_filters'),
    ],
    data: function () {
        return {
            activeMintMap: {},
            cachedWeightDataMap: {},
            chart: null,
            chartType: "time",
            diagramMode: null,
            filters: {},
            graphOffset: 5,
            hideCanvasForTransition: false,
            mintLocationMarkerGroup: null,
            mintRegions: [],
            painter: null,
            selectedLayerIndex: 0,
            selectedMintIds: [],
            selectedTreasureIds: [],
            showTable: false,
            treasures: [],
            unknownWeights: 0,
            weightDataFrequency: 0.1,
            yearCountData: {},
            // null means no filter is applied, an empty array means all treasures are filtered out, so no treasure is shown.
            filteredTreasureIds: null,
            filterConfigLoaded: false,
            overlay: null,
        };
    },
    computed: {
        activeTreasures() {
            if (this.filteredTreasureIds === null) return this.treasures
            return this.treasures.filter(treasure => this.filteredTreasureIds.includes(treasure.id))
        },
        availableBaseLayerButtons() {
            const layerNames = [
                "modern",
                "satellite",
                "topo"
            ]

            return layerNames.map(name => {
                return {
                    name: name,
                    image: `/image/ottoman/map-baselayer-previews/${name}.png`,
                }
            })
        },
        hasUncertainYears() {
            // if(!this.yearCountData["undefined"]) return false
            // return this.yearCountData["undefined"].reduce((acc, a) => acc + a, 0) > 0
            return true
        },
        hasDescription() {
            if (!this.selectedTreasures[0].description) return false

            const parser = new DOMParser()
            const doc = parser.parseFromString(this.selectedTreasures[0].description, "text/html")
            const text = doc.body.textContent || ""
            return text.trim().length !== 0
        },
        filterConfig: () => ottomanFilterConfig,
        filtersActive() {
            return Object.values(this.filters).length > 0
        },
        selectedTreasures() {
            const t = this.treasures.filter(t => this.selectedTreasureIds.includes(t.id))
            return t
        },
        mints() {
            let mints = this.mintRegions?.slice() || []
            return mints.sort(Sort.stringPropAlphabetically("name"))
        }
    },
    watch: {
        selectedTreasures(){
            if(this.selectedTreasures.length === 0){
                this.showTable = false;
            }
        }
    },
    created() {
        window.graphics = this.featureGroup

        settings.boxStepSize = this.$mconfig.getInteger("map.hoards.box_step_size", 10)
        settings.boxMinSize = this.$mconfig.getInteger("map.hoards.box_min_size", 5)
        settings.stepSizeGroupsInPercent = this.$mconfig.getArray("map.hoards.step_size_groups_in_percent")




        // settings.onSettingsChanged((changedSettings) => {
        //     let settings = this.overlaySettings;
        //     changedSettings.forEach(([key, value]) => {
        //         settings[key] = value;
        //     });
        //     this.overlaySettings = Object.assign(this.overlaySettings, settings);
        //     this.overlay.repaint();
        // });

        // this.overlay = new MaterialOverlay(this.featureGroup, settings, {
        //     onGeoJSONTransform: (features) => {
        //         features.forEach((feature) => {
        //             feature.data.types.forEach((type) => {
        //                 type.route = this.$router.resolve({
        //                     name: 'Catalog Entry',
        //                     params: { id: type.id },
        //                 });
        //             });
        //         });
        //     },
        // });
    },
    mounted: async function () {
        try {
            const result = await Query.raw(`{
                mintRegion { id name location }
                getYearOfMintRange {from, to}
                getYearOfLossRange {from, to}
            }`)
            this.mintRegions = result.data.data.mintRegion

            function applyRange(name, value) {
                const from = value?.from;
                const to = value?.to;

                let config = ottomanFilterConfig["real-range"].find(range => range.name === name)
                if (from == null || to == null) {
                    config.disabled = true
                } else {
                    config.min = from;
                    config.max = to;
                }
            }
            window.filterConfig = ottomanFilterConfig
            applyRange("yearOfMint", result?.data?.data?.getYearOfMintRange)
            applyRange("yearOfLoss", result?.data?.data?.getYearOfLossRange)
            this.filterConfigLoaded = true

            this.overlay = new OttomanTreasureOverlay(this.featureGroup, settings, {
                additionalData: {
                    mints: this.mintRegions
                },
                onDataTransformed: (data) => {
                    this.treasures = data.treasures
                },
                onEnd: () => {
                    this.mounted_and_loaded_mixin_loaded("data")
                },
                onSelectTreasure: (id) => {
                    this.selectedMintIds = []

                    if (this.selectedTreasureIds.includes(id)) {
                        this.selectedTreasureIds.splice(this.selectedTreasureIds.indexOf(id), 1)
                    } else {
                        this.selectedTreasureIds = [id]
                    }

                    this.selectionChanged()
                },
                onSelectMint: (id) => {

                    this.selectedTreasureIds = []
                    if (this.selectedMintIds.includes(id)) {
                        this.selectedMintIds.splice(this.selectedMintIds.indexOf(id), 1)
                    } else {
                        this.selectedMintIds = [id]
                    }

                    this.selectionChanged()
                },
                onBringToFront: () => {
                    this.bringMintsToFront()
                }
            })


            const diagramCanvas = this.$refs.diagramCanvas
            const diagramContext = diagramCanvas.getContext('2d')
            this.chart = new Chart(diagramContext, {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                    }]
                },
                options: {
                    borderWidth: 0,
                    aspectRatio: .7,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 10,
                                boxHeight: 10,
                                useBorderRadius: 4,
                                // sort: Sort.stringPropAlphabetically("text"),
                            },

                        }
                    }
                }
            })

            window.addEventListener('resize', this.resizeCanvas);
            this.update()

            const hideMarkersThreshold = this.$mconfig.getInteger("map.hoards.marker_zoom_threshold", 0)
            this.map.on("zoomend", () => {
                const zoom = this.map.getZoom()
                this.overlay.hideMarkersOnSpecifiedZoomLevel(zoom, hideMarkersThreshold)
            })

            //this is a hack to make sure the diagram is updated after the map is loaded
            setTimeout(() => {
                this.updateDiagram()
            }, 1000)
        } catch (error) {
            console.error("Error in mounted hook:", error)
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);
    },
    methods: {
        debounceFilters: debounce(function (data) {
            this.filtersChanged(data)
        }, 300),
        filtersChanged({ filters }) {
            this.filters = filters;
            this.catalog_filter_mixin_updateActive(this.$refs.catalogFilter, [
                'excludeFromMapApp',
                'mint',
                'yearOfMint',
            ]);

            const switchFilters = ['reliableAttribution', 'completeHoard', 'ottomanPredominance']
            switchFilters.forEach(filter => {
                if (this.filters[filter] === false) {
                    delete this.filters[filter]
                }
            })

            this.applyYearOfMintFilter()
            this.save();
        },
        applyYearOfMintFilter() {
            Query.raw(`query filterOttomanTreasures($filters: OttomanTreasureFilter){filterOttomanTreasures(filters: $filters)}`, {
                filters: this.filters
            }).then(result => {
                this.filteredTreasureIds = result.data.data.filterOttomanTreasures ?? null

                if (this.overlay) {
                    this.overlay.setTreasureFilterMask(this.filteredTreasureIds)
                } else {
                    console.error("Overlay is not initialized yet")
                }
            }).catch(error => {
                console.error("Error filtering treasures", error)
            })
        },
        recalculateCatalogSidebar() {
            this.$refs.catalogSidebar?.recalculate();
        },
        save() {
            this.catalog_filter_mixin_save(this.$refs.catalogFilter);
        },
        getFilteredMints() {
            const mints = this.mints.filter(mint => mint.name !== "xxx")
            let activeMints = []
            let interactiveMints = []
            mints.forEach(mint => {
                if (this.activeMintMap[mint.id]) {
                    activeMints.push(mint)
                } else {
                    interactiveMints.push(mint)
                }
            })

            activeMints = activeMints.sort(Sort.stringPropAlphabetically("name"))
            interactiveMints = interactiveMints.sort(Sort.stringPropAlphabetically("name"))

            return [...activeMints, ...interactiveMints]
        },
        getSelectedTreasureStyle(treasure) {
            if (this.activeTreasures.find(t => t.id === treasure.id)) {
                return {}
            } else {
                return {
                    opacity: 0.5,
                }
            }
        },
        invertBackgroundIfNecessary(color) {
            return Color.isBright(color)
        },
        getActiveMints() {
            return Object.values(this.activeMintMap).sort(Sort.stringPropAlphabetically("name"))
        },
        getActiveMintsHTML(mint) {
            let html = ""
            if (mint.count > 0) {
                html += `(${mint.count})`
            }

            if (Object.keys(mint.treasures).length > 0) {
                html += ` <span style="font-size: 0.8em;">`
                html += Object.values(mint.treasures).sort(Sort.stringPropAlphabetically("treasure.name")).map(obj => {
                    return `<span style="color: ${obj.treasure.color}">${obj.count}</span>`
                }).join(", ")
                html += `</span>`
            }

            return html
        },
        mounted_and_loaded_mixin_mountedAndLoaded() {
            this.removeInvalidIds()
        },
        removeInvalidIds() {
            this.selectedTreasureIds = this.selectedTreasureIds.filter(id => this.treasures.find(t => t.id === id))
        },
        clearDiagram(){
            this.$refs.diagramSelect.value = null
            this.updateDiagram()
        },
        updateDiagram() {
            if (!this.$refs.diagramSelect) return
            const value = this.$refs.diagramSelect.value
            this.diagramMode = value === "" ? null : value
            this.local_storage_mixin_save()

            if (value) {
                let map = {}

                const colors = [[213, 168, 57],
                [177, 75, 225],
                [138, 229, 65],
                [88, 55, 179],
                [216, 220, 52],
                [207, 79, 185],
                [106, 205, 88],
                [121, 117, 212],
                [197, 211, 95],
                [57, 35, 96],
                [99, 222, 159],
                [215, 69, 117],
                [69, 147, 76],
                [221, 69, 51],
                [115, 219, 215],
                [138, 56, 40],
                [124, 170, 216],
                [207, 117, 52],
                [76, 93, 137],
                ]

                const pickedColors = {}

                function getIndexBySring(str) {
                    let index = 0
                    let maxLength = 7
                    for (let i = 0; i < str.length && i < maxLength; i++) {
                        index += str.charCodeAt(i)
                    }
                    return index
                }

                function getColor(obj) {
                    let color
                    if (obj && obj.color) color = obj.color
                    else {
                        const name = obj?.name || "no_name"
                        const idx = getIndexBySring(name)

                        let colorIdx = idx % colors.length
                        while (pickedColors[colorIdx]) {
                            colorIdx = (++colorIdx % colors.length)
                        }

                        pickedColors[colorIdx] = true
                        color = `rgb(${colors[(colorIdx)].join(",")})`
                    }
                    return color
                }

                if (value === "fragment") {

                    map = {
                        fragment: {
                            label: null,
                            count: 0,
                            color: getColor(),
                        },
                        no_fragment: {
                            label: null,
                            count: 0,
                            color: getColor(),
                        },
                    }

                    this.selectedTreasures.forEach((treasure, index) => {
                        treasure.items.forEach(itemArr => {
                            itemArr.items.forEach(item => {
                                let target = (item.fragment) ? "fragment" : "no_fragment"
                                map[target].count += parseInt(item.count) || 1
                            })
                        })
                    })

                    Object.keys(map).forEach(key => {
                        map[key].label = this.$tc(`property.label.fragment.${key}`)

                        if (map[key].count === 0) {
                            delete map[key]
                        }
                    })

                } else if (value === "typeOfDenomination") {
                    this.selectedTreasures.forEach((treasure, index) => {
                        treasure.items.forEach(itemArr => {
                            itemArr.items.forEach(item => {
                                const count = parseInt(item.count) || 1
                                const name = item.typeOfDenomination || "no_name"
                                if (!map[name]) {
                                    map[name] = {
                                        count: 0,
                                        color: getColor(item[value]),
                                        label: item[value] || this.$t(`property.label.${value}.no_name`)
                                    }
                                }
                                map[name].count += count
                            })
                        })
                    })

                } else if (value === "person") {

                    this.selectedTreasures.forEach((treasure, index) => {
                        treasure.items.forEach(itemArr => {
                            itemArr.items.forEach(item => {
                                if (!item[value]) return

                                const from = item[value].reign?.from ?? "?"
                                const to = item[value].reign?.to ?? "?"

                                let reign = (from === "?" && to === "?") ? "?" : `${from}-${to}`

                                const count = parseInt(item.count) || 1
                                const name = item[value].name
                                if (!map[name]) {
                                    let label = item[value].name
                                    if (name != "Unknown") {
                                        label += ` (${reign})`
                                    }


                                    map[name] = {
                                        count: 0,
                                        reignFrom: from === "?" ? null : from,
                                        color: getColor(item[value]),
                                        label
                                    }
                                }
                                map[name].count += count
                            })
                        })
                    })

                } else {
                    this.selectedTreasures.forEach((treasure, index) => {
                        treasure.items.forEach(itemArr => {
                            itemArr.items.forEach(item => {
                                const count = parseInt(item.count) || 1
                                const name = item[value]?.name || "no_name"
                                if (!map[name]) {
                                    map[name] = {
                                        count: 0,
                                        color: getColor(item[value]),
                                        label: item[value]?.name || this.$t(`property.label.${value}.no_name`)
                                    }
                                }
                                map[name].count += count
                            })
                        })
                    })
                }

                let dataArray
                if (value === "person") {
                    dataArray = Object.values(map).sort((a, b) => {
                        if (a.label === "Unknown") return 1
                        if (b.label === "Unknown") return -1

                        if (!a.reignFrom) return 1
                        if (!b.reignFrom) return -1

                        return a.reignFrom - b.reignFrom
                    })
                } else {
                    dataArray = Object.values(map).sort(Sort.stringPropAlphabetically('label'))
                }

                this.chart.data.datasets[0].backgroundColor = dataArray.map(obj => obj.color)
                this.chart.data.labels = dataArray.map(obj => obj.label)
                this.chart.data.datasets[0].data = dataArray.map(obj => obj.count)
                this.chart.update()
            }

            this.resizeCanvas()

        },
        resizeCanvas() {
            console.log(this.diagramMode)
            if (!this.diagramMode) {
                this.$refs.diagramContainer.style.height = 0
            } else {
                const aspect = this.chart.aspectRatio
                const width = this.$refs.diagramContainer.clientWidth;
                this.$refs.diagramContainer.style.height = (width / aspect) + "px"
            }
        },
        isActiveMint(mint) {
            return this.selectedTreasures.some(treasure => {
                return treasure.items.some(item => {
                    return item.items.some(treasureItem => {
                        return treasureItem.mintRegion.id === mint.id
                    })
                })
            })
        },
        getMintCount(mint, treasure) {
            let count = 0;
            treasure.items.forEach(item => {
                if (item.mintRegion.id === mint.id) {
                    count += parseInt(item.count) || 0
                }
            })
            return count
        },
        toggleTimeline() {
            this.timeline_mixin_toggleTimeline()

        },
        local_storage_mixin_loaded() {
            this.mounted_and_loaded_mixin_loaded("storage")
        },
        resetFilters() {
            this.$refs.catalogFilter?.resetFilters();
        },
        async update() {
            // this.updateMintLocationMarker()
            await this.overlay.update({
                selections: {
                    treasures: this.selectedTreasureIds,
                    mints: this.selectedMintIds
                }
            })


            this.updateActiveMintMap()
            this.bringMintsToFront()
        },

        bringMintsToFront() {
            // this.mintLocationMarkerGroup.bringToFront()

        },

        addMintSelection(mintIds = []) {
            let selectedMintIds = this.selectedMintIds.slice()

            mintIds.forEach(id => {
                if (selectedMintIds.includes(id)) {
                    selectedMintIds.splice(selectedMintIds.indexOf(id), 1)
                } else {
                    selectedMintIds.push(id)
                }
            })

            this.mintSelectionChanged(selectedMintIds)
        },
        selectMint(mintId) {
            let selection = []

            if (this.selectedMintIds.length > 1) {
                selection = [mintId]
            } else {
                if (this.selectedMintIds.includes(mintId)) {
                    selection = []
                } else {
                    selection = [mintId]
                }
            }



            this.mintSelectionChanged(selection)
        },
        mintSelectionChanged(selectedMints) {
            this.selectedMintIds = selectedMints

            if (this.selectedMintIds.length > 0) {
                this.selectedTreasureIds = []
            }

            this.selectionChanged()
        },
        selectionChanged() {
            this.update()
            this.updateDiagram()
            this.local_storage_mixin_save()
        },
        updateActiveMintMap() {

            this.activeMintMap = {}

            this.selectedTreasures.forEach(treasure => {
                treasure.items.forEach(item => {
                    if (item.mintRegion === null) return

                    if (!this.activeMintMap[item.mintRegion.id]) {
                        this.activeMintMap[item.mintRegion.id] = item.mintRegion
                        this.activeMintMap[item.mintRegion.id].count = 0
                        this.activeMintMap[item.mintRegion.id].treasures = {}
                    }

                    if (!this.activeMintMap[item.mintRegion.id].treasures[treasure.id]) {
                        this.activeMintMap[item.mintRegion.id].treasures[treasure.id] = { treasure, count: 0 }
                    }

                    this.activeMintMap[item.mintRegion.id].count += parseInt(item.count) || 1
                    this.activeMintMap[item.mintRegion.id].treasures[treasure.id].count += parseInt(item.count) || 1
                })
            })

            // Reassign to trigger vue reactivity
            this.activeMintMap = { ...this.activeMintMap }
        },
        isTreasureSelected(id) {
            return this.selectedTreasureIds.includes(id)
        },
        toggleTreasure(id) {
            if (this.isTreasureSelected(id)) {
                this.selectedTreasureIds.splice(this.selectedTreasureIds.indexOf(id), 1)
            } else {
                this.selectedTreasureIds.push(id)
            }
            this.selectedMintIds = []
            this.selectionChanged()
        },
        setTreasure(id) {
            this.selectedMintIds = []

            if (this.selectedTreasureIds.length === 1 && this.selectedTreasureIds[0] === id) {
                this.selectedTreasureIds = []
            } else {
                this.selectedTreasureIds = [id]
            }

            this.selectionChanged()
        }
    }
};
</script>


<style lang="scss">
.center-ui-top-ottoman .map-toolbar .toolbar {
    pointer-events: all;
}
</style>

<style
    lang="scss"
    scoped
>
table {
    width: 100%;
    padding-right: 10px;
}


.diagram-select-bar {
    display: flex;

    .select-wrapper {
        flex: 1;
        display: flex;
        position: relative;
    }

    select {
        flex: 1;
        margin-right: math.div($padding, 2);
    }
}

.diagram-view {
    display: flex;
    flex-direction: column;
    gap: $padding;
    transition: transform 0.5s ease-in;
    transform: translateY(0);

    &.hide {
        height: 0;
        transform: translateY(100px);
    }

    &.collapsed {
        canvas {
            height: 0 !important;
        }
    }
}

.timeline {
    margin: 1em;
    margin-bottom: 1.5em;
    height: 180px;
    max-height: 20vh;
    min-height: 100px;
}

.bottom-center-ui {
    min-width: 0;
    max-width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: $padding;
    padding-bottom: 20px;
    pointer-events: none;
}

.bottom-center-ui>* {
    pointer-events: all;
}

.treasure-description {
    box-sizing: border-box;
    width: 400px;
    margin: 0 1em;
    padding: .5rem;
    background-color: $white;
    border: $border;
    border-radius: $border-radius;

    max-height: 300px;
    max-width: 100%;
    min-width: 0;
    overflow-y: auto;
    overflow-x: auto;
}



tr {
    cursor: pointer;
    user-select: none;
}

tr.selected {
    background-color: $primary-color;
}

.mint-count-text-wrapper {
    font-size: 0.7rem;
    font-weight: bold;
    margin-left: .25em;
    width: 2.5em;
    display: inline-block;
    text-align: right;
}

.mint-count-text {
    background-color: rgba(255, 255, 255, 0.5);
    padding: 2px;
    border-radius: 1px;
}

.mint-count-text.inverted {
    background-color: rgba(0, 0, 0, 0.5);
}


.diagram-select-bar {
    display: flex;
}

.diagram-view {
    select {
        height: 100%;
        flex: 1;
    }
}

.diagram-select-placeholder {
    overflow: clip;
    position: absolute;
    z-index: 100;
    pointer-events: none;
    top: 0;
    left: 0;
    right: 1.3rem;
    bottom: 0;
    padding: 0 .5rem;
    display: flex;
    align-items: center;
    font-style: italic;
    opacity: 0.5;
}

.sidebar-header {
    color: $gray;
    margin: $small-padding $padding;
}

.center-ui-wrapper {
    position: relative;
    pointer-events: none;
    display: grid;
    grid-row: span 3;
}

.no-results {
    padding: 0 2em;
    text-align: center;
    color: $gray;
    font-style: italic;
}
</style>