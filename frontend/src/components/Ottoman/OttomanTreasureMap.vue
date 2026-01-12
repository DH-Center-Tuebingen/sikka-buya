<template>
    <div class="treasure-map ui">
        <Sidebar>
            <template #title>
                <Locale
                    path="general.filter"
                    :count="2"
                />
            </template>

            <CatalogFilter
                ref="catalogFilter"
                :init-data="catalog_filter_mixin_initData"
                :filter-config="filterConfig"
                :force-all="true"
                :page-info="pageInfo"
                @loading="setLoading"
                @update="dataUpdated"
                @dynamic-change="recalculateCatalogSidebar"
                @toggled="save"
                @error="(e) => $store.commit('printError', e)"
            />
        </Sidebar>

        <div class="center-ui center-ui-top">
            <map-toolbar
                :filters-active="filtersActive"
                @reset-filters="resetFilters"
            />
        </div>
        <div class="center-ui center-ui-center" />

        <div class="bottom-center-ui center-ui-center">
            <ScrollView
                v-if="selectedTreasures.length === 1"
                :key="`list-item-description-${selectedTreasures[0].id}`"
                class="treasure-description"
                style="margin-bottom: 40px;"
            >
                <h2 style="margin-top: 0;">
                    {{ selectedTreasures[0].name }}
                </h2>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div v-html="selectedTreasures[0].description" />
            </ScrollView>
            <div v-else />

            <MapBaseLayerButton
                v-model="selectedLayerIndex"
                :layers="availableBaseLayerButtons"
                style="justify-self: flex-end;"
            />
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

            <MultiSelectList style="flex: 1;">
                <template v-for="treasure in treasures">
                    <MultiSelectListItem
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
                </template>
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
                                <option value="material">
                                    <Locale path="property.material" />
                                </option>
                                <option value="epoch">
                                    <Locale path="property.epoch" />
                                </option>
                                <option value="fragment">
                                    <Locale path="property.fragment" />
                                </option>
                            </select>
                        </div>
                        <ButtonVue
                            :disabled="diagramMode === null"
                            @click="() => diagramMode = null"
                        >
                            <Icon
                                type="mdi"
                                :path="icons.mdiClose"
                                :size="IconSize.Tiny"
                            />
                        </ButtonVue>
                    </div>

                    <canvas
                        ref="diagramCanvas"
                        height="500"
                    />
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
import CatalogFilter from '@/components/page/catalog/CatalogFilter.vue';
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

export default {
    components: {
        ButtonVue,
        CatalogFilter,
        ListColorIndicator,
        Locale,
        MapToolbar,
        MapBaseLayerButton,
        MultiSelectList,
        MultiSelectListItem,
        Sidebar,
        ScrollView,
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
            pageInfo: { page: 0, count: 100000 },
            selectedLayerIndex: 0,
            selectedMintIds: [],
            selectedTreasureIds: [],
            treasures: [],
            unknownWeights: 0,
            weightDataFrequency: 0.1,
            yearCountData: {},
        };
    },
    computed: {
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


        const result = await Query.raw(`{mintRegion { id name location }}`)
        this.mintRegions = result.data.data.mintRegion

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
                this.selectedTreasureIds = [id]
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
                            sort: Sort.stringPropAlphabetically("text"),
                        },

                    }
                }
            }
        })

        // this.mintLocationMarkerGroup = this.$L.featureGroup()
        // this.mintLocationMarkerGroup.addTo(this.map)

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
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);
    },
    methods: {
        dataUpdated(data) {
            this.catalog_filter_mixin_updateActive(this.$refs.catalogFilter, [
                'excludeFromMapApp',
                'mint',
                'yearOfMint',
            ]);

            // this.drawTimeline()

            // Note: OttomanTreasureOverlay fetches its own data via update() method
            // Unlike MaterialMap which uses setData/repaint pattern
            // The overlay is updated via the update() method called elsewhere

            this.save();
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

                const mapValues = Object.values(map)
                this.chart.data.datasets[0].backgroundColor = mapValues.map(obj => obj.color)
                this.chart.data.labels = mapValues.map(obj => obj.label)
                this.chart.data.datasets[0].data = mapValues.map(obj => obj.count)
                this.chart.update()
            }
        },

        resizeCanvas() {
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
            this.filters = {}
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
    align-items: flex-start;
}

.treasure-description {

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
</style>