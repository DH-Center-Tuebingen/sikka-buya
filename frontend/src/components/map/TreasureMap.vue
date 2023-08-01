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

        <!-- <Sidebar
            side="right"
            ref="catalogSidebar"
        >

        </Sidebar> -->
    </div>
</template>
  
<script>
// Mixins
import map from './mixins/map';
import settingsMixin from '../map/mixins/settings';
import timeline from './mixins/timeline';


//Components
import Button from '../layout/buttons/Button.vue';
import CatalogFilter from '../page/catalog/CatalogFilter.vue';
import LabeledInputContainer from '../LabeledInputContainer.vue';
import MintList from '../MintList.vue';
import Sidebar from './Sidebar.vue';
import Timeline from './timeline/Timeline.vue';

// Other
import TreasureOverlay from '../../maps/TreasureOverlay';
import Settings from '../../settings';
import URLParams from '../../utils/URLParams';
import ListSelectionTools from '../interactive/ListSelectionTools.vue';
import Locale from '../cms/Locale.vue';
import MapToolbar from "./MapToolbar.vue"
import TimelineSlideshowArea from './TimelineSlideshowArea.vue';


const queryPrefix = 'map-filter-';
let settings = new Settings(window, 'TreasureOverlay');
const overlaySettings = settings.load();

export default {
    components: {
        Button,
        LabeledInputContainer,
        Locale,
        MapToolbar,
        Sidebar,
        Timeline,
        TimelineSlideshowArea
    },
    data: function () {
        return {
            filters: {},
            painter: null,
            chart: null,
        };
    },
    mixins: [
        map,
        timeline,
        settingsMixin(overlaySettings),
    ],
    computed: {
        filtersActive() {
            return Object.values(this.filters).length > 0
        }
    },
    created() {
        window.graphics = this.featureGroup
        this.overlay = new TreasureOverlay(this.featureGroup, settings, {

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


        this.overlay.update()
    },
    methods: {
        resetFilters() {
            this.filters = {}
        }
    }
};
</script>
  
<style lang="scss"></style>
  