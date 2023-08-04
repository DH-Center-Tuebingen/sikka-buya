<template>
    <div class="material-map ui">
        <Sidebar>
            <template #title>
                <Locale
                    path="property.mint"
                    :count="2"
                />
            </template>

            <ul>
                <li
                    v-for="mint of mints"
                    :key="`mint-list-item-${mint.id}`"
                >
                    {{ mint.name }} - {{ mint.count }}
                </li>
            </ul>


        </Sidebar>

        <div class="center-ui center-ui-top">
            <map-toolbar
                :filtersActive="filtersActive"
                @reset-filters="resetFilters"
            />
        </div>
        <div class="center-ui center-ui-center"></div>
        <div class="center-ui center-ui-bottom">

            <TimelineSlideshowArea
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

            </TimelineSlideshowArea>
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

            <MultiSelectList>
                <template v-for="treasure in treasures">
                    <MultiSelectListItem
                        :key="`list-item-${treasure.id}`"
                        :selected="isTreasureSelected(treasure.id)"
                        @click.native="toggleTreasure(treasure.id)"
                        @checkbox-selected="(val) => setTreasure(treasure.id, val)"
                    >
                        {{ treasure.name }}
                    </MultiSelectListItem>
                    <TreasureTable
                        :key="`treasure-table-${treasure.id}`"
                        v-if="isTreasureSelected(treasure.id)"
                        :item="treasure"
                    >
                    </TreasureTable>
                </template>
            </MultiSelectList>

        </Sidebar>
    </div>
</template>
  
<script>
// Mixins
import map from './mixins/map';
import settingsMixin from '../map/mixins/settings';
import TimelineMixin from './mixins/timeline';
import MountedAndLoadedMixin from '../mixins/mounted-and-loaded';

//Components
import Button from '../layout/buttons/Button.vue';
import CatalogFilter from '../page/catalog/CatalogFilter.vue';
import LabeledInputContainer from '../LabeledInputContainer.vue';
import MintList from '../MintList.vue';
import Sidebar from './Sidebar.vue';
import Timeline from './timeline/Timeline.vue';
import TreasureTable from "./TreasureTable.vue";

// Other
import TreasureOverlay from '../../maps/TreasureOverlay';
import Settings from '../../settings';
import URLParams from '../../utils/URLParams';
import ListSelectionTools from '../interactive/ListSelectionTools.vue';
import Locale from '../cms/Locale.vue';
import MapToolbar from "./MapToolbar.vue"
import TimelineSlideshowArea from './TimelineSlideshowArea.vue';
import MultiSelectList from '../MultiSelectList.vue';
import MultiSelectListItem from '../MultiSelectListItem.vue';


const queryPrefix = 'map-filter-';
let settings = new Settings(window, 'TreasureOverlay');
const overlaySettings = settings.load();


import LocaleStorageMixin from "../mixins/local-storage-mixin"
import Sort from '../../utils/Sorter';
import { BarGraph } from '../../models/timeline/TimelineChart';

export default {
    components: {
        Button,
        LabeledInputContainer,
        Locale,
        MapToolbar,
        Sidebar,
        Timeline,
        TimelineSlideshowArea,
        TreasureTable,
        MultiSelectList,
        MultiSelectListItem
    },
    data: function () {
        return {
            filters: {},
            painter: null,
            chart: null,
            treasures: [],
            selectedTreasureIds: [],
        };
    },
    mixins: [
        map,
        TimelineMixin(),
        settingsMixin(overlaySettings),
        LocaleStorageMixin("treasure-map", [
            "selectedTreasureIds"
        ]),
        MountedAndLoadedMixin(['storage', 'data'])
    ],
    computed: {
        timelineChart() {
            return this.$refs.timelineSlideshowArea.timelineChart
        },
        filtersActive() {
            return Object.values(this.filters).length > 0
        },
        selectedTreasures() {
            const t = this.treasures.filter(t => this.selectedTreasureIds.includes(t.id))
            return t
        },
        mints() {
            let mints = {}

            this.selectedTreasures.forEach(t => {
                t.items.forEach(item => {
                    const mint = item.mint
                    const count = item.count || 1

                    if (mint) {
                        if (!mints[item.mint.id]) {
                            mint.count = count
                            mints[item.mint.id] = mint
                        }
                        else {
                            mints[item.mint.id].count += mint.count
                        }
                    } else {
                        if (!mints["unknown"]) {
                            mints["unknown"] = { name: "unknown", id: -1, count }
                        }
                        else {
                            mints["unknown"].count += count
                        }
                    }
                })
            })
            return Object.values(mints).sort(Sort.stringPropAlphabetically("name"))
        }
    },
    created() {
        window.graphics = this.featureGroup
        this.overlay = new TreasureOverlay(this.featureGroup, settings, {
            onDataTransformed: (data) => {
                this.treasures = data
            },
            onEnd: () => {
                this.mounted_and_loaded_mixin_loaded("data")
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


        // this.$nextTick(() => {
        //     for (let [key, val] of Object.entries(this.$route.query)) {
        //         if (
        //             key.startsWith(queryPrefix) &&
        //             this.$refs?.catalogFilter?.activeFilters
        //         ) {
        //             let value = val;

        //             const filterKey = key.replace(queryPrefix, '');
        //             try {
        //                 value = JSON.parse(val);
        //             } catch (e) {
        //                 console.warn(e);
        //             }

        //             this.$refs.catalogFilter.setFilter(filterKey, value);
        //         }
        //     }

        //     // We clear the URL params after we have set the filters
        //     // This is to prevent the filters from being applied again on reload.
        //     // The values are stored anyways in the localstorage.
        //     URLParams.clear()
        // });

        await this.initTimeline();
        // this.updateTimeline(true);


        this.update()
    },
    methods: {

        local_storage_mixin_loaded() {
            this.mounted_and_loaded_mixin_loaded("storage")
        },
        resetFilters() {
            this.filters = {}
        },
        async update() {
            await this.overlay.update({
                selections: {
                    treasures: this.selectedTreasureIds
                }
            })

            this.updateTimelineGraph()
        },
        updateTimelineGraph() {
            let treasureData = {}
            const colors = []
            let maxMap = {}

            let yearSet = new Set()

            this.selectedTreasures.forEach((treasure, treasureIndex) => {

                colors.push(treasure.color)
                let data = {}

                treasure.items.forEach((item) => {
                    const year = parseInt(item.year)
                    const mint = item.mint

                    if (!isNaN(year) && mint) {
                        yearSet.add(year)

                        if (!data[year]) {
                            data[year] = 0
                        }
                        const count = item.count || 1
                        data[year] += count
                    }
                })

                treasureData[treasureIndex] = data
            })

            let combied = {}
            yearSet.forEach(year => {
                combied[year] = { x: year, y: [] }
                Object.entries(treasureData).forEach(([treasureIndex, data]) => {
                    let y = (data[year] || 0)
                    combied[year].y.push(y)
                })
            })

            let data = Object.values(combied).sort((a, b) => a.x - b.x)

            let yMax = Object.values(combied).reduce((max, current) => {
                let currentMax = current.y.reduce((acc, a) => acc + a, 0)
                return Math.max(max, currentMax)
            }, -Infinity)

            const yearOffset = 2
            if (data.length == 0) return
            let from = parseInt(data[0].x) - yearOffset
            let to = parseInt(data[data.length - 1].x) + yearOffset

            this.timeline_mixin_set({
                from,
                to
            })


            this.timelineChart.update({
                graphs: new BarGraph(data, { colors, yMax, yOffset: 3 }),
                timeline: this.timeline
            })
        },
        selectionChanged() {
            this.update()
            this.local_storage_mixin_save()
        },
        isTreasureSelected(id) {
            return this.selectedTreasureIds.includes(id)
        },
        toggleTreasure(id) {
            if (this.isTreasureSelected(id)) {
                this.selectedTreasureIds.splice(this.selectedTreasureIds.indexOf(id), 1)
                this.selectionChanged()
            } else {
                this.selectedTreasureIds.push(id)
                this.selectionChanged()
            }
        },
        setTreasure(id, value) {
            const selected = this.isTreasureSelected(id)
            if (value && !selected) {
                this.selectedTreasureIds.push(id)
                this.selectionChanged()
            } else if (!value && selected) {
                this.selectedTreasureIds.splice(this.selectedTreasureIds.indexOf(id), 1)
                this.selectionChanged()
            }
        }
    }
};
</script>
  
<style lang="scss"></style>
  