<template>
    <div class="treasure-map ui">
        <Sidebar>
            <template #title>
                <Locale
                    path="property.mint"
                    :count="2"
                />
            </template>

            <table>
                <tbody>
                    <tr
                        v-for="mint of mints"
                        :key="`mint-list-item-${mint.id}`"
                        :class="{
                            'selected': selectedMintIds.includes(mint.id)
                        }"
                        @click="selectMints([mint.id])"
                    >
                        <td>
                            {{ mint.name }}
                        </td>
                        <td
                            v-for="treasure of selectedTreasures"
                            :key="`mint-count-${treasure.id}`"
                            :style="`color: ${treasure.color}`"
                        >
                            {{ getMintCount(mint, treasure) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </Sidebar>

        <div class="center-ui center-ui-top">
            <map-toolbar
                :filtersActive="filtersActive"
                @reset-filters="resetFilters"
            />
        </div>
        <div class="center-ui center-ui-center"></div>
        <div
            class="center-ui center-ui-bottom"
            :class="{
                'hideable-transform': true,
                'hide-transform-bottom': (selectedTreasures.length === 0)
            }"
        >
            <Timeline
                class="ui-element"
                :value="raw_timeline.value"
                :from="timeline.from"
                :to="timeline.to"
                :interactive="false"
                ref="timeline"
            >
                <template #background>

                    <canvas
                        class="timeline-canvas"
                        ref="timelineCanvas"
                    > </canvas>
                    <canvas
                        id="highlight-canvas"
                        class="timeline-canvas"
                        ref="highlightCanvas"
                    >
                    </canvas>
                    <!-- <slot name="background" /> -->
                </template>


                <template
                    #footer
                    v-show="hasUncertainYears"
                >
                    <Locale path="label.timeline.uncertain_years" />

                    <template v-if="yearCountData.undefined != undefined">
                        <span style="margin-left: 1em;">
                            {{ yearCountData.undefined.y.reduce((acc, val) => acc + val, 0)
                            }}</span>

                        <template v-if="selectedTreasures.length > 1">
                            (
                            <template
                                v-for="(treasure, index) of selectedTreasures"
                                style=""
                            >
                                <span
                                    v-if="index > 0"
                                    :key="`spacer-${index}`"
                                >, </span>
                                <span
                                    :key="index"
                                    :style="{ color: treasure.color }"
                                >{{ yearCountData.undefined.y[index] }}</span>
                            </template>
                            )
                        </template>
                    </template>
                </template>
            </Timeline>


            <!-- <TimelineSlideshowArea
                ref="timelineSlideshowArea"
                :map="map"
                :timelineFrom="timeline.from"
                :timelineTo="timeline.to"
                :timelineValue="raw_timeline.value"
                :timelineInteractive="false"
                :timelineActive="timelineActive"
                @toggle="toggleTimeline"
                timelineName="additional-map"
            >
                <template #background>
                    <canvas
                        id="timeline-canvas"
                        ref="timelineCanvas"
                    > </canvas>
                </template>

            </TimelineSlideshowArea> -->
        </div>

        <Sidebar
            style="grid-column: 3;"
            side="right"
            ref="catalogSidebar"
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
                    <div
                        class="treasure-description"
                        v-if="isTreasureSelected(treasure.id)"
                        v-html="treasure.description"
                        :key="`list-item-description-${treasure.id}`"
                    >

                    </div>
                </template>
            </MultiSelectList>
            <template #footer>
                <div
                    class="diagram-view"
                    :class="{ hide: !(selectedTreasures.length > 0) }"
                    style="margin: 1em;margin-top: auto;"
                >
                    <h3>
                        <Locale path="label.diagram" />
                    </h3>
                    <select
                        ref="diagramSelect"
                        @input="updateDiagram"
                    >
                        <option
                            value="material"
                            selected
                        >
                            <Locale path="property.material" />
                        </option>
                        <option value="epoch">
                            <Locale path="property.epoch" />
                        </option>
                        <option value="fragment">
                            <Locale path="property.fragment" />
                        </option>
                    </select>

                    <canvas
                        height="300px"
                        ref="diagramCanvas"
                    >

                    </canvas>
                </div>
            </template>
        </Sidebar>
    </div>
</template> 
  
<script>
// Mixins
import map from './mixins/map';
import settingsMixin from '../map/mixins/settings';
import TimelineMixin from './mixins/timeline';
import TimelineHighlightMixin from '../mixins/timeline-highlight-mixin';
import MountedAndLoadedMixin from '../mixins/mounted-and-loaded';

//Components
import Button from '../layout/buttons/Button.vue';
import LabeledInputContainer from '../LabeledInputContainer.vue';
import Sidebar from './Sidebar.vue';
import Timeline from './timeline/Timeline.vue';
import TreasureTable from "./TreasureTable.vue";

// Other
import TreasureOverlay from '../../maps/TreasureOverlay';
import Settings from '../../settings';
import Locale from '../cms/Locale.vue';
import MapToolbar from "./MapToolbar.vue"
import MultiSelectList from '../MultiSelectList.vue';
import MultiSelectListItem from '../MultiSelectListItem.vue';
import Chart from "chart.js/auto"

import cloneDeep from 'lodash/cloneDeep';


const queryPrefix = 'map-filter-';
let settings = new Settings(window, 'TreasureOverlay');
const overlaySettings = settings.load();


import LocaleStorageMixin from "../mixins/local-storage-mixin"
import Sort from '../../utils/Sorter';
import TimelineChart, { BarGraph, MirrorGraph } from '../../models/timeline/TimelineChart';
import ListColorIndicator from '../list/ListColorIndicator.vue';
import Query from '../../database/query';
import { MintLocationMarker } from "../../models/mintlocation"

import L from 'leaflet'
import Info from '../forms/Info.vue';
import CoinSideGroup from '../display/CoinSideGroup.vue';



export default {
    name: 'TreasureMap',
    components: {
        Button,
        LabeledInputContainer,
        ListColorIndicator,
        Locale,
        MapToolbar,
        MultiSelectList,
        MultiSelectListItem,
        Sidebar,
        Timeline,
        TreasureTable,
        Info
    },
    data: function () {
        return {
            chart: null,
            filters: {},
            painter: null,
            selectedTreasureIds: [],
            selectedMintIds: [],
            timelineChart: null,
            treasures: [],
            yearCountData: {},
            mintRegions: [],
            mintLocationMarkerGroup: null,
        };
    },
    mixins: [
        map,
        TimelineHighlightMixin({
            canvasRef: "highlightCanvas", timelineRef: "timeline", tooltipCallback: function (tooltip, year) {

                const data = this.yearCountData[year]


                let htmlText = `<b>${year}`
                let countsHtml = []
                if (data) {
                    data.y.forEach((count, index) => {
                        const treasure = this.selectedTreasures[index]
                        if (count > 0) {
                            countsHtml.push(`<span style="color: ${treasure.color}">${count}</span>`)
                        }
                    })
                }

                if (countsHtml.length > 0) {
                    htmlText += `</b>: ${countsHtml.join(", ")}`
                } else {
                    htmlText += `</b>`

                }

                tooltip.innerHTML = htmlText
            }
        }),
        TimelineMixin(),
        settingsMixin(overlaySettings),
        LocaleStorageMixin("treasure-map", [
            "selectedTreasureIds",
            "selectedMintIds",
        ]),
        MountedAndLoadedMixin(['storage', 'data'])
    ],
    computed: {
        hasUncertainYears() {
            // if(!this.yearCountData["undefined"]) return false
            // return this.yearCountData["undefined"].reduce((acc, a) => acc + a, 0) > 0
            return true
        },
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
        this.overlay = new TreasureOverlay(this.featureGroup, settings, {
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
            }
        })


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

        this.timelineChart = new TimelineChart(this.$refs.timelineCanvas, { from: this.timeline.from, to: this.timeline.to });

        const result = await Query.raw(`{mintRegion { id name location }}`)
        this.mintRegions = result.data.data.mintRegion


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
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        })

        this.mintLocationMarkerGroup = this.L.featureGroup()
        this.mintLocationMarkerGroup.addTo(this.map)

        await this.initTimeline();
        this.updateTimeline(true);
        window.addEventListener('resize', this.resizeCanvas);
        this.update()

        //this is a hack to make sure the diagram is updated after the map is loaded
        setTimeout(() => {
            this.updateDiagram()
        }, 1000)


        this.map.setMaxBounds(null)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);
    },
    methods: {
        mounted_and_loaded_mixin_mountedAndLoaded() {
            this.removeInvalidIds()
        },
        removeInvalidIds() {
            this.selectedTreasureIds = this.selectedTreasureIds.filter(id => this.treasures.find(t => t.id === id))
        },

        updateMintLocationMarker() {
            this.mintLocationMarkerGroup.clearLayers()

            const vueContext = this
            this.mintRegions.forEach(region => {
                const geoJSON = new this.L.geoJSON(region.location, {
                    pointToLayer(point) {
                        let position = point.geometry ? point.geometry : point
                        const latlng = { lat: position.coordinates[0], lng: position.coordinates[1] }
                        let geoObj

                        const active = vueContext.selectedMintIds.includes(region.id)
                        if (!point?.properties?.radius) {
                            const mlm = new MintLocationMarker(region)
                            geoObj = mlm.create(latlng, { size: (active) ? 10 : 4, active })
                        } else {
                            const mlmStyle = active ? MintLocationMarker.activeStyle : MintLocationMarker.normalStyle 
                            geoObj = L.circle(latlng, point.properties.radius, Object.assign({
                                weight: 1,
                                fillOpacity: 0.5
                            }, mlmStyle))
                        }
                        return geoObj
                    }
                })
                geoJSON.bindTooltip(region.name, { sticky: true })
                geoJSON.on("click", () => {
                    if (vueContext.selectedTreasureIds.length === 0) {
                        vueContext.selectedMintIds = [region.id]
                        vueContext.update()
                    }
                })
                geoJSON.addTo(this.mintLocationMarkerGroup)
            })
        },
        updateDiagram() {
            if (!this.$refs.diagramSelect) return
            const value = this.$refs.diagramSelect.value

            if (value) {
                let map = {}

                const colors = [
                    [255, 99, 132],
                    [54, 162, 235],
                    [255, 206, 86],
                    [75, 192, 192],
                    [153, 102, 255],
                    [255, 159, 64],
                ]
                let colorIdx = -1

                function getColor(obj) {
                    colorIdx = (++colorIdx % colors.length)
                    return obj?.color ? obj.color : `rgb(${colors[(colorIdx)].join(",")})`
                }

                if (value === "fragment") {

                    map = {
                        "fragment": {
                            label: null,
                            count: 0,
                            color: getColor(),
                        },
                        "no_fragment": {
                            label: null,
                            count: 0,
                            color: getColor(),
                        },
                    }

                    Object.keys(map).forEach(key => {
                        map[key].label = this.$tc(`property.label.fragment.${key}`)
                    })

                    this.selectedTreasures.forEach((treasure, index) => {
                        treasure.items.forEach(itemArr => {
                            itemArr.items.forEach(item => {
                                let target = (item.fragment) ? "fragment" : "no_fragment"
                                map[target].count += parseInt(item.count) || 1
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

                const mapValues = Object.values(map)
                this.chart.data.datasets[0].backgroundColor = mapValues.map(obj => obj.color)
                this.chart.data.labels = mapValues.map(obj => obj.label)
                this.chart.data.datasets[0].data = mapValues.map(obj => obj.count)
                this.chart.update()
            }
        },

        resizeCanvas() {
            this.timelineChart.updateSize()
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
            if (this.timelineActive) {
                this.$nextTick(() => {
                    this.updateTimelineGraph()
                })
            }
        },
        local_storage_mixin_loaded() {
            this.mounted_and_loaded_mixin_loaded("storage")
        },
        resetFilters() {
            this.filters = {}
        },
        async update() {
            this.updateMintLocationMarker()
            await this.overlay.update({
                selections: {
                    treasures: this.selectedTreasureIds,
                    mints: this.selectedMintIds
                }
            })

            this.updateYearCount()
            this.updateTimelineGraph()
        },
        updateTimeline() {
            console.warn("NOTHING TO DO", arguments)
        },
        updateTimelineGraph() {

            const data = Object.values(this.yearCountData).flat().filter(a => !isNaN(parseInt(a.x))).sort()

            let graph = null
            if (this.selectedTreasureIds.length === 2) {
                graph = this.updateMirrorGraph(data)
            } else {
                graph = this.updateBarGraph(data)
            }

            const yearOffset = 2
            let from = 300
            let to = 470
            if (data.length > 0) {
                from = parseInt(data[0].x) - yearOffset
                to = parseInt(data[data.length - 1].x) + yearOffset
            }

            this.timeline_mixin_set({
                from,
                to
            })

            this.timelineChart.update({
                graphs: graph,
                timeline: this.timeline
            })
        },
        updateBarGraph(data) {

            let yMax = Object.entries(this.yearCountData)
                .filter(([key]) => key !== "undefined")
                .map(([_, val]) => {
                    return val
                })
                .reduce((max, current) => {
                    let currentMax = current.y.reduce((acc, a) => acc + a, 0)
                    return Math.max(max, currentMax)
                }, -Infinity)

            return new BarGraph(data, {
                hlines: true, colors: this.yearCountColors, yMax, yOffset: 10, maxWidth: 10
            })
        },
        updateMirrorGraph(data) {

            let topMax = 0
            let bottomMax = 0

            data.forEach((obj) => {
                topMax = Math.max(topMax, obj.y[0])
                bottomMax = Math.max(bottomMax, obj.y[1])
            })

            return new MirrorGraph(data, {
                topMax,
                bottomMax,
                offset: 10,
                bottomOffset: 10,
                colors: this.yearCountColors,
                hlines: true
            })
        },
        updateYearCount() {
            let treasureData = {}
            const colors = []
            let yearSet = new Set()

            this.selectedTreasures.forEach((mintObj, treasureIndex) => {
                colors.push(mintObj.color)
                let data = {}

                mintObj.items.forEach((mintItem) => {

                    mintItem.items.forEach(treasureItem => {
                        const mint = treasureItem.mintRegion

                        let year = parseInt(treasureItem.year)
                        if (isNaN(year)) {
                            year = "undefined"
                        }

                        yearSet.add(year)

                        if (!data[year]) {
                            data[year] = 0
                        }

                        const count = treasureItem.count || 1
                        data[year] += count
                    })


                })

                treasureData[treasureIndex] = data
            })

            let yearCountData = {}
            yearSet.forEach(year => {
                yearCountData[year] = { x: year, y: [] }
                Object.entries(treasureData).forEach(([treasureIndex, data]) => {
                    let y = (data[year] || 0)
                    yearCountData[year].y.push(y)
                })
            })

            this.yearCountColors = colors
            this.yearCountData = yearCountData
        },
        selectMints(mintIds = []) {

            if(mintIds.every(id => this.selectedMintIds.includes(id))) {
                mintIds = []
            }

            this.selectedMintIds = mintIds

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
            this.selectedTreasureIds = [id]
            this.selectedMintIds = []
            this.selectionChanged()
        }
    }
};
</script>

  
<style lang="scss" scoped>
table {
    width: 100%;
    padding-right: 10px;
}

.diagram-view {
    display: flex;
    flex-direction: column;
    gap: $padding;
    height: 420px;
    transition: all 0.3s ease-in;

    select {
        height: 40px;
    }

    &.hide {
        height: 0;
    }
}

.timeline {
    margin: 1em;
    margin-bottom: 1.5em;
    height: 180px;
    max-height: 20vh;
    min-height: 100px;
}

.treasure-description {
    margin: 0 1em;
    padding: .5rem;
    background-color: $white;
    border: $border;
    border-radius: $border-radius;

    max-height: 300px;
    overflow-y: auto;
}



tr {
    cursor: pointer;
    user-select: none;
}

tr.selected {
    background-color: $primary-color;
}
</style>
  