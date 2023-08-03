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

            <!-- 
            <TimelineSlideshowArea
                ref="timeline"
                :map="map"
                :timelineReadonly="true"
                :timelineFrom="timeline.from"
                :timelineTo="timeline.to"
                :timelineValue="raw_timeline.value"
                :timelineActive="timelineActive"
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
import timeline from './mixins/timeline';
import Vue from 'vue';

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
            selectedTreasuresIds: [],
        };
    },
    mixins: [
        map,
        timeline,
        settingsMixin(overlaySettings),
        LocaleStorageMixin("treasure-map", [
            "selectedTreasuresIds"
        ])
    ],
    computed: {
        filtersActive() {
            return Object.values(this.filters).length > 0
        },
        selectedTreasures() {
            console.log(this.selectedTreasuresIds)
            return this.treasures.filter(t => this.selectedTreasuresIds.includes(t.id))
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
            console.log(mints)

            return Object.values(mints).sort(Sort.stringPropAlphabetically("name"))
        }
    },
    created() {
        window.graphics = this.featureGroup
        this.overlay = new TreasureOverlay(this.featureGroup, settings, {
            onDataTransformed: (data) => {
                this.treasures = data
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


        this.$nextTick(() => {
            for (let [key, val] of Object.entries(this.$route.query)) {
                if (
                    key.startsWith(queryPrefix) &&
                    this.$refs?.catalogFilter?.activeFilters
                ) {
                    let value = val;

                    const filterKey = key.replace(queryPrefix, '');
                    try {
                        value = JSON.parse(val);
                    } catch (e) {
                        console.warn(e);
                    }

                    this.$refs.catalogFilter.setFilter(filterKey, value);
                }
            }

            // We clear the URL params after we have set the filters
            // This is to prevent the filters from being applied again on reload.
            // The values are stored anyways in the localstorage.
            URLParams.clear()
        });

        await this.initTimeline();
        // this.updateTimeline(true);


        this.update()
    },
    methods: {
        resetFilters() {
            this.filters = {}
        },
        update() {
            this.overlay.update({
                selections: {
                    treasures: this.selectedTreasuresIds
                }
            })
        },
        selectionChanged() {
            this.update()
            this.local_storage_mixin_save()
        },
        isTreasureSelected(id) {
            return this.selectedTreasuresIds.includes(id)
        },
        toggleTreasure(id) {
            if (this.isTreasureSelected(id)) {
                this.selectedTreasuresIds.splice(this.selectedTreasuresIds.indexOf(id), 1)
                this.selectionChanged()
            } else {
                this.selectedTreasuresIds.push(id)
                this.selectionChanged()
            }
        },
        setTreasure(id, value) {
            const selected = this.isTreasureSelected(id)
            if (value && !selected) {
                this.selectedTreasuresIds.push(id)
                this.selectionChanged()
            } else if (!value && selected) {
                this.selectedTreasuresIds.splice(this.selectedTreasuresIds.indexOf(id), 1)
                this.selectionChanged()
            }
        }
    }
};
</script>
  
<style lang="scss"></style>
  