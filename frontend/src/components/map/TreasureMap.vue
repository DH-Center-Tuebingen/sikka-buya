<template>
    <div class="treasure-map ui">
        <Sidebar>
            <template #title>
                <Locale
                    path="property.mint"
                    :count="2"
                />
            </template>



            <MultiSelectList>
                <MultiSelectListItem
                    v-for="mint of mints"
                    :key="`mint-list-item-${mint.id}`"
                    :class="{
                        'selected': selectedMintIds.includes(mint.id)
                    }"
                    :selected="selectedMintIds.includes(mint.id)"
                    @checkbox-selected="() => addMintSelection([mint.id])"
                    @click.native="selectMint(mint.id)"
                >
                    {{ mint.name }}
                </MultiSelectListItem>
            </MultiSelectList>



            <!-- <table>
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
            </table> -->
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
                :create-marks="false"
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


                <template #footer>
                    <Row>
                        <div>
                            <span>
                                <Locale path="label.timeline.uncertain_years" />:
                            </span>
                            <template v-if="yearCountData.undefined != undefined">
                                <span style="margin-left: 1em;">
                                    {{ yearCountData.undefined.y.reduce((acc, val) => acc + val, 0) || 0 }}
                                </span>

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
                            <span v-else>0</span>
                        </div>

                        <div class="button-group">
                            <radio-button-group
                                v-if="chartType === 'weight'"
                                id="weight-frequency"
                                :labels="['0.01', '0.1', '1']"
                                :options="['0.01', '0.1', '1']"
                                :value="weightDataFrequency.toString()"
                                @input="updateWeightFrequency"
                            >

                            </radio-button-group>
                        </div>
                        <div
                            class="button-group"
                            style="justify-content: flex-end; display: flex;"
                        >
                            <radio-button-group
                                id="chart-type"
                                :tlabels="['property.time', 'property.weight']"
                                :options="['time', 'weight']"
                                v-model="chartType"
                                @input="updateTimelineGraph"
                            >

                            </radio-button-group>
                        </div>
                    </Row>
                </template>
            </Timeline>


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

                        <template #beneath>
                            <ScrollView
                                class="treasure-description"
                                v-if="isTreasureSelected(treasure.id)"
                                v-html="treasure.description"
                                :key="`list-item-description-${treasure.id}`"
                            >

                            </ScrollView>
                        </template>
                    </MultiSelectListItem>

                </template>
            </MultiSelectList>
            <template #footer>
                <div
                    class="diagram-view"
                    :class="{ hide: !(selectedTreasures.length > 0), collapsed: diagramMode === null }"
                    style="margin: 1em;margin-top: auto;"
                >
                    <select
                        ref="diagramSelect"
                        @input="updateDiagram"
                    >
                        <option
                            :value="null"
                            selected
                        >
                            <Locale path="label.diagram" />
                        </option>
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

                    <canvas
                        height="500px"
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
import RadioButtonGroup from '../forms/RadioButtonGroup.vue';

//Components
import LabeledInputContainer from '../LabeledInputContainer.vue';
import Sidebar from './Sidebar.vue';
import Timeline from './timeline/Timeline.vue';
import TreasureTable from "./TreasureTable.vue";
import ScrollView from '../layout/ScrollView.vue';

// Other
import TreasureOverlay from '../../maps/TreasureOverlay';
import Settings from '../../settings';
import Locale from '../cms/Locale.vue';
import MapToolbar from "./MapToolbar.vue"
import MultiSelectList from '../MultiSelectList.vue';
import MultiSelectListItem from '../MultiSelectListItem.vue';
import Chart from "chart.js/auto"
import { FrequencySampler } from "../../models/chart/sampler"

let settings = new Settings(window, 'TreasureOverlay');
const overlaySettings = settings.load();


import LocaleStorageMixin from "../mixins/local-storage-mixin"
import Sort from '../../utils/Sorter';
import TimelineChart, { BarGraph, MirrorGraph, RangeGraph, TickGraph, LineGraph } from '../../models/timeline/TimelineChart';
import ListColorIndicator from '../list/ListColorIndicator.vue';
import Query from '../../database/query';
import { MintLocationMarker } from "../../models/mintlocation"

import L from 'leaflet'
import { cloneDeep } from 'lodash'
import Info from '../forms/Info.vue';
import Range from '../../models/timeline/range';
import Color from '../../utils/Color';
import Row from '../layout/Row.vue';
import { fixPrecision } from "../../utils/Number"


export default {
    name: 'TreasureMap',
    components: {
        LabeledInputContainer,
        ListColorIndicator,
        Locale,
        MapToolbar,
        MultiSelectList,
        MultiSelectListItem,
        Sidebar,
        Timeline,
        TreasureTable,
        Info,
        ScrollView,
        Row,
        RadioButtonGroup,
    },
    data: function () {
        return {
            chart: null,
            diagramMode: null,
            chartType: null,
            filters: {},
            painter: null,
            selectedTreasureIds: [],
            selectedMintIds: [],
            timelineChart: null,
            treasures: [],
            yearCountData: {},
            mintRegions: [],
            mintLocationMarkerGroup: null,
            cachedWeightDataMap: {},
            weightDataFrequency: 0.1,
            graphOffset: 5,
            tickGraphOptions: { options: { longDash: 20, longDashThickness: 2 }, contextStyles: { strokeStyle: Color.Black } }
        };
    },
    mixins: [
        map,
        TimelineHighlightMixin({
            canvasRef: "highlightCanvas", timelineRef: "timeline", tooltipCallback: function (tooltip, value) {

                if (this.chartType === "weight") {
                    const data = this.cachedWeightDataMap[value]

                    if (Array.isArray(data)) {

                        tooltip.innerHTML = `<b>[${value},${fixPrecision(value + this.weightDataFrequency)})</b>:`

                        const treasures = []

                        data.forEach((count, index) => {
                            const treasure = this.selectedTreasures[index]
                            if (count > 0) {
                                treasures.push(`<span style="color: ${treasure.color}">${count}</span>`)
                            }
                        })

                        tooltip.innerHTML += ` ${treasures.join(", ")}`
                    } else {
                        tooltip.innerHTML = `<b>[${value},${fixPrecision(value + this.weightDataFrequency)})</b>: ${this.cachedWeightDataMap[value] || 0}`
                    }
                }
                else {
                    const data = this.yearCountData[value]
                    let htmlText = `<b>${value}`
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
            }
        }),
        TimelineMixin(),
        settingsMixin(overlaySettings),
        LocaleStorageMixin("treasure-map", [
            "selectedTreasureIds",
            "selectedMintIds",
            "chartType"
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

        settings.boxStepSize = this.$mconfig.getInteger("map.hoards.box_step_size", 10)
        settings.boxMinSize = this.$mconfig.getInteger("map.hoards.box_min_size", 5)
        settings.stepSizeGroupsInPercent = this.$mconfig.getArray("map.hoards.step_size_groups_in_percent")

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
            },
            onBringToFront: () => {
                this.bringMintsToFront()
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
                borderWidth: 0,
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

                        let marker
                        const active = vueContext.selectedMintIds.includes(region.id)
                        if (point?.properties?.radius) {
                            // const mlmStyle = active ? MintLocationMarker.activeStyle : MintLocationMarker.normalStyle

                            const group = vueContext.L.featureGroup()

                            const mintRegionMarker = new MintLocationMarker(region)
                            let mlm = mintRegionMarker.create(latlng, { size: (active) ? 7 : 4, active })


                            let activeStyle = {}
                            if (active) {
                                activeStyle = {
                                    color: "white",
                                    fillColor: "#000"
                                }
                            }

                            const circle = L.circle(latlng, point.properties.radius, Object.assign({
                                weight: 1,
                                fillOpacity: 0.75,

                            }, MintLocationMarker.normalStyle, activeStyle))
                            
                            circle.addTo(group)
                            mlm.addTo(group)


                            /**
                             * Hides the markers at a specific zoom level
                             */
                            vueContext.map.on("zoomend", () => {
                                const zoom = vueContext.map.getZoom()
                                if (zoom > vueContext.$mconfig.getInteger("map.hoards.marker_zoom_threshold", 0)) {
                                    group.removeLayer(mlm)
                                } else {
                                    group.addLayer(mlm)
                                }
                            })

                            group.addLayer(mlm)
                            group.getElement = () => {
                                return mlm.getElement()
                            }
                            marker = group
                        } else {
                            const mintRegionMarker = new MintLocationMarker(region)
                            marker = mintRegionMarker.create(latlng, { size: (active) ? 7 : 4, active })
                        }
                        return marker
                    }
                })
                geoJSON.bindTooltip(region.name, { sticky: true })
                geoJSON.on("click", () => {
                    if (vueContext.selectedTreasureIds.length === 0) {
                        if (vueContext.selectedMintIds.includes(region.id)) {
                            vueContext.selectedMintIds = vueContext.selectedMintIds.filter(id => id !== region.id)
                        } else {
                            vueContext.selectedMintIds = [region.id]
                        }

                        vueContext.update()
                    }
                })
                geoJSON.addTo(this.mintLocationMarkerGroup)
            })
        },
        updateDiagram() {
            if (!this.$refs.diagramSelect) return
            const value = this.$refs.diagramSelect.value
            this.diagramMode = value === "" ? null : value

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
                [117, 139, 51],
                [144, 63, 120],
                [190, 220, 156],
                [91, 38, 54],
                [212, 181, 130],
                [211, 153, 201],
                [48, 88, 52],
                [204, 126, 123],
                [84, 153, 136],
                [80, 67, 28],
                [143, 118, 64]]
                let colorIdx = -1

                function getColor(obj) {
                    colorIdx = (++colorIdx % colors.length)
                    return obj?.color ? obj.color : `rgb(${colors[(colorIdx)].join(",")})`
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

                const types = Object.keys(map).length
                this.chart.options.plugins.legend.display = types <= 8
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
            this.bringMintsToFront()
        },

        bringMintsToFront() {
            // this.mintLocationMarkerGroup.bringToFront()

        },
        updateTimeline() {
            console.warn("NOTHING TO DO", arguments)
        },
        updateWeightFrequency(value) {
            this.weightDataFrequency = parseFloat(parseFloat(value).toPrecision(10))
            this.updateTimelineGraph()
        },
        updateTimelineGraph() {

            let data = {
                graphs: [],
                timeline: null
            }

            if (this.chartType === "weight") {
                const frequency = this.weightDataFrequency
                this.timelineChart.unitBase = frequency

                this.timeline_highlight_set({
                    windowWidth: frequency,
                    cursorWidth: frequency,
                    unitBase: frequency,
                    align: "left",
                })

                // this.timeline_highlight_graph.disable()
                data = this.updateTimelineWeightGraph()
            } else {
                // this.timeline_highlight_graph.enable()
                this.timelineChart.unitBase = 1

                this.timeline_highlight_set({
                    windowWidth: 1,
                    cursorWidth: 1,
                    unitBase: 1,
                    align: "center",
                })


                data = this.updateTimelineTimeGraph()
            }


            if (data.timeline != null) {
                this.timeline_highlight_setOverrideTimeline(data.timeline)
            } else {
                data.timeline = this.timeline
                this.timeline_highlight_unsetOverrideTimeline()
            }

            this.timelineChart.update(data)
        },
        updateTimelineWeightGraph() {
            const data = this.getWeightData()

            let timeline = { from: 0, to: 0 }
            let graphs = []

            let allSamples = []

            if (data.length === 1) {

                const { data: treasureData, color: treasureColor } = data[0]
                const frequency = this.weightDataFrequency
                const { samples, max } = new FrequencySampler(treasureData, {
                    frequency,
                }).sample()

                allSamples.push(...samples)

                this.cachedWeightDataMap = samples.reduce((acc, obj) => {
                    acc[obj.x.toString()] = obj.y
                    return acc
                }, {})

                const weightGraph = new BarGraph(samples, {
                    hlines: true,
                    yOffset: this.graphOffset,
                    frequency,
                    yMax: max,
                    unitBase: frequency,
                    colors: [treasureColor],
                    align: "left",
                })

                graphs.push(weightGraph)


            } else if (data.length === 2) {

                let colors = []
                const maxs = []
                let start = Infinity
                let end = -Infinity
                let allSampleObjects = []

                for (const { data: treasureData, color: treasureColor } of Object.values(data)) {
                    colors.push(treasureColor)

                    const frequency = this.weightDataFrequency
                    const { samples, max, start: treasure_start, end: treasure_end } = new FrequencySampler(treasureData, {
                        frequency,
                    }).sample()

                    if (start > treasure_start) start = treasure_start
                    if (end < treasure_end) end = treasure_end

                    maxs.push(max)
                    allSamples.push(...samples)


                    let sampleObject = samples.reduce((acc, obj) => {
                        acc[obj.x.toString()] = obj.y
                        return acc
                    }, {})
                    allSampleObjects.push(sampleObject)
                }

                let mirrorData = []

                for (let x = start; x <= end; x += this.weightDataFrequency) {

                    x = fixPrecision(x)

                    let y = []

                    for (let i = 0; i < allSampleObjects.length; i++) {
                        const sample = allSampleObjects[i]
                        if (sample[x]) {
                            y.push(sample[x])
                        } else {
                            y.push(0)
                        }
                    }

                    mirrorData.push({ x, y })
                }

                this.cachedWeightDataMap = mirrorData.reduce((acc, obj) => {
                    acc[obj.x.toString()] = obj.y
                    return acc
                }, {})

                const weightGraph = new MirrorGraph(mirrorData, {
                    hlines: true,
                    offset: this.graphOffset,
                    frequency: this.weightDataFrequency,
                    unitBase: this.weightDataFrequency,
                    topMax: maxs[0],
                    bottomMax: maxs[1],
                    colors,
                    align: "left",
                })
                graphs.push(weightGraph)

            }

            allSamples = allSamples.sort((a, b) => a.x - b.x)
            timeline = (allSamples.length > 0) ? { from: allSamples[0].x, to: allSamples[allSamples.length - 1].x } : { from: 0, to: 0 }

            const tickGraph = new TickGraph(timeline.from, timeline.to, {
                options: { ...this.tickGraphOptions.options, steps: [0.1, 0.5, 1, 2, 5, 10, 20, 50, 100] },
                contextStyles: this.tickGraphOptions.contextStyles,
            })


            const nonZeroSamples = allSamples.filter(a => a.y > 0)
            let nonZeroRanges = Range.fromPointArray(nonZeroSamples, { mergeDistance: this.weightDataFrequency })

            const nonZeroGraph = new RangeGraph(nonZeroRanges, {
                contextStyles: {
                    fillStyle: Color.LightGray,
                },
                translate: 0.5 * this.weightDataFrequency
            })

            graphs.unshift(nonZeroGraph)
            graphs.push(tickGraph)



            return {
                graphs,
                timeline
            }
        },
        getWeightData() {
            return this.selectedTreasures.map(treasure => {
                let data = []
                treasure.items.forEach(itemArr => {
                    itemArr.items.forEach(item => {
                        if (item.weight) {
                            data.push({ x: item.weight, y: 1 })
                        }
                    })
                })
                return {
                    color: treasure.color,
                    data: data.sort((a, b) => a.x - b.x)
                }
            })
        },
        updateTimelineTimeGraph() {
            const data = Object.values(this.yearCountData).flat().filter(a => !isNaN(parseInt(a.x))).sort()

            if (data.length === 0) {
                return {
                    graphs: [],
                    timeline: null
                }
            }

            let graph = null
            if (this.selectedTreasureIds.length === 2) {
                console.log(data)
                graph = this.updateMirrorGraph(data)
            } else {
                graph = this.updateBarGraph(data)
            }

            const nonZeroGraph = new RangeGraph(Range.fromPointArray(data), {
                contextStyles: {
                    fillStyle: Color.LightGray
                }
            })

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

            const tickGraph = new TickGraph(from, to, this.tickGraphOptions)

            return {
                graphs: [nonZeroGraph, graph, tickGraph],
                timeline: null
            }
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
                offset: this.graphOffset,
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
    max-height: 50vh;
    transition: all 0.3s ease-in;
    transform: translateY(0);

    &.hide {
        height: 0;
        transform: translateY(100px);
    }

    canvas {
        transition: height 0.3s ease-in-out;
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
  