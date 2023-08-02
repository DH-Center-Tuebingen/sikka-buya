<template>
    <div class="material-map ui">
        <!-- <Sidebar>


        </Sidebar> -->

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
            selectedTreasures: [],
        };
    },
    mixins: [
        map,
        timeline,
        settingsMixin(overlaySettings),
        LocaleStorageMixin("treasure-map", [
            "selectedTreasures"
        ])
    ],
    computed: {
        filtersActive() {
            return Object.values(this.filters).length > 0
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
                    treasures: this.selectedTreasures
                }
            })
        },
        selectionChanged() {
            this.update()
            this.local_storage_mixin_save()
        },
        isTreasureSelected(id) {
            return this.selectedTreasures.includes(id)
        },
        toggleTreasure(id) {
            if (this.isTreasureSelected(id)) {
                this.selectedTreasures.splice(this.selectedTreasures.indexOf(id), 1)
                this.selectionChanged()
            } else {
                this.selectedTreasures.push(id)
                this.selectionChanged()
            }
        },
        setTreasure(id, value) {
            const selected = this.isTreasureSelected(id)
            if (value && !selected) {
                this.selectedTreasures.push(id)
                this.selectionChanged()
            } else if (!value && selected) {
                this.selectedTreasures.splice(this.selectedTreasures.indexOf(id), 1)
                this.selectionChanged()
            }
        }
    }
};
</script>
  
<style lang="scss"></style>
  