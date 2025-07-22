<template>
  <div class="material-map ui">
    <Sidebar>
      <template #title>
        <Locale path="map.mint_selection" />
      </template>

      <template v-slot:tools>
        <list-selection-tools
          @select-all="selectAllMints"
          @unselect-all="clearMintSelection"
          :hideSelectAllButton="true"
          :allSelected="allMintsSelected"
          :noneSelected="mint_locations_mixin_noneSelected"
        />
      </template>

      <mint-list
        :items="mintList"
        :selectedIds="selectedMints"
        @selectionChanged="(val) => mintSelectionChanged(val, { preventUpdate: true })
        "
      />
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
        ref="timeline"
        :map="map"
        :timelineCreateMarks="false"
        :timelineFrom="timeline.from"
        :timelineTo="timeline.to"
        :timelineValue="raw_timeline.value"
        :timelineActive="timelineActive"
        :shareLink="getShareLink()"
        timelineName="additional-map"
        @input="timelineChanged"
        @toggle="timelineToggled"
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
      side="right"
      ref="catalogSidebar"
    >

      <template #title>
        <Locale path="map.type_filter" />
      </template>

      <div class="padding-box">
        <catalog-filter
          ref="catalogFilter"
          :initData="catalog_filter_mixin_initData"
          :filterConfig="filterConfig"
          @loading="setLoading"
          @update="dataUpdated"
          @dynamic-change="recalculateCatalogSidebar"
          @toggled="save"
          @error="(e) => $store.commit('printError', e)"
          :forceAll="true"
          :pageInfo="pageInfo"
          :exclude="[
            'mint',
            'yearOfMint',
            'ruler',
            'buyid',
            'caliph',
            'treadwellId',
            'projectId',
            'heir'
          ]"
          :overwriteFilters="overwriteFilters"
          typeBody="
                        id
                        projectId
                        yearOfMint
                        material {
                          id
                          name
                          color
                        }
                        mint {
                          id
                          name
                          location 
                          uncertain
                          province {
                            id
                            name
                          }
                        }
                        excludeFromTypeCatalogue
                        "
        />
      </div>
    </Sidebar>
  </div>
</template>

<script>
// Mixins
import catalogFilterMixin from '../mixins/catalog-filter';
import map from './mixins/map';
import {
  MintLocationsMixin,
  loadSelectedMints,
} from './mixins/MintLocationsMixin';
import SettingsMixin from '../map/mixins/settings';
import TimelineMixin from './mixins/timeline';
import slideshow from '../mixins/slideshow';


//Components
import Button from '../layout/buttons/Button.vue';
import CatalogFilter from '../page/catalog/CatalogFilter.vue';
import Checkbox from '../forms/Checkbox.vue';
import LabeledInputContainer from '../LabeledInputContainer.vue';
import MintList from '../MintList.vue';
import Sidebar from './Sidebar.vue';
import Slider from '../forms/Slider.vue';
import Timeline from './timeline/Timeline.vue';

// Other

import Range from "../../models/timeline/range.js"
import MaterialOverlay from '../../maps/MaterialOverlay';
import Settings from '../../settings';
import Sorter from '../../utils/Sorter';
import URLParams from '../../utils/URLParams';
import ListSelectionTools from '../interactive/ListSelectionTools.vue';
import Locale from '../cms/Locale.vue';
import MapToolbar from "./MapToolbar.vue"
import { FilterSlide } from '../../models/slide';
import TimelineSlideshowArea from './TimelineSlideshowArea.vue';
import Query from '../../database/query';
import { RangeGraph, LineGraph, NoDataModule, TickGraph } from '../../models/timeline/TimelineChart.js';
import Color from '../../utils/Color';
import { useMaterialConfig } from '../../config/catalog_filter';

const queryPrefix = 'map-filter-';
let settings = new Settings(window, 'MaterialOverlay');
const overlaySettings = settings.load();
const selectedMints = loadSelectedMints();

export default {
  name: 'MaterialMap',
  components: {
    Button,
    CatalogFilter,
    Checkbox,
    LabeledInputContainer,
    ListSelectionTools,
    Locale,
    MapToolbar,
    MintList,
    Sidebar,
    Slider,
    Timeline,
    TimelineSlideshowArea
  },
  data: function () {
    return {
      filteredMintLayer: null,
      filteredMintLocation: null,
      materialLayer: null,
      mintData: {},
      mintLayer: null,
      mintLocation: null,
      mints: [],
      mintTimelineData: [],
      overwriteFilters: {
        yearOfMint: null,
        mint: selectedMints
      },
      pageInfo: { page: 0, count: 100000 },
      painter: null,
      chart: null,
      filterConfig: useMaterialConfig(),
    };
  },
  mixins: [
    map,
    TimelineMixin(),
    slideshow,
    SettingsMixin(overlaySettings),
    MintLocationsMixin({
      showMarkers: false,
      onMintSelectionChanged(selection) {
        this.overwriteFilters.mint = selection;
      },
    }),
    catalogFilterMixin('sikka-buya-material-map-filters', {

    }),
  ],
  computed: {
    mintList() {
      function addAvailability(mint, available) {
        mint.available = available;
        return mint;
      }

      return [
        ...this.availableMints
          .map((mint) => addAvailability(mint, true))
          .sort(Sorter.stringPropAlphabetically('name')),
        ...this.unavailableMints
          .map((mint) => addAvailability(mint, false))
          .sort(Sorter.stringPropAlphabetically('name')),
      ];
    },
    filtersActive() {
      return (
        this.selectedMints.length > 0 || this.catalog_filter_mixin_filterActive
      );
    },
  },
  created() {
    settings.onSettingsChanged((changedSettings) => {
      let settings = this.overlaySettings;
      changedSettings.forEach(([key, value]) => {
        settings[key] = value;
      });
      this.overlaySettings = Object.assign(this.overlaySettings, settings);
      this.overlay.repaint();
    });

    this.overlay = new MaterialOverlay(this.featureGroup, settings, {
      onGeoJSONTransform: (features) => {
        features.forEach((feature) => {
          feature.data.types.forEach((type) => {
            type.route = this.$router.resolve({
              name: 'Catalog Entry',
              params: { id: type.id },
            });
          });
        });
      },
    });
  },
  mounted: async function () {
    await this.fetchMints();
    if (this.$route.query['selectedMints']) {
      let selectedMints = URLParams.get('selectedMints', "array")
      if (selectedMints)
        this.selectedMints = selectedMints
    }

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
    this.updateTimeline(true);
  },
  methods: {
    getShareLink() {
      return URLParams.generate(this.getOptions()).href;
    },
    slideshowSlidesLoaded({ slideshow, slides }) {
      // TODO: This is a hack to make sure the mints are loaded before we apply the display options
      setTimeout(() => {
        this.applyDisplayOptionToLoadedSlides({ slideshow, slides })
      }, 1000);
    },
    applyDisplayOptionToLoadedSlides({ slideshow, slides }) {
      slides = slides.map(slide => {
        if (typeof slide.location === "string")
          slide.location = URLParams.fromStringArray(slide.location)

        slide = FilterSlide.formatDisplay(slide, this.mints)
        return slide
      })

      slideshow.updateSlides(slides);
    },
    recalculateCatalogSidebar() {
      this.$refs.catalogSidebar.recalculate();
    },
    requestSlideOptions({ slideshow, index, overwrite } = {}) {
      const catalogOptions = Object.assign({}, this.getOptions(), this.$refs.catalogFilter.getStorage())
      let { options, display } = FilterSlide.formatDisplay({ options: catalogOptions }, this.mints)
      slideshow.createSlide({ options, display, index, overwrite });
    },
    applySlide(options = {}) {
      let location = options.location
      if (typeof location === "string")
        location = location.split(',')
          .reduce((acc, val, index) => {
            acc[index % 2 === 0 ? 'lat' : 'lng'] = parseFloat(val);
            return acc;
          }, {})

      if (options.zoom && options.location) {
        this.map.flyTo(location, options.zoom);
      }

      if (options.year && options.year !== 'null') {
        this.timelineActive = true;
        this.timeChanged(options.year);
      } else {
        this.timelineActive = false;
      }

      if (options.selectedMints) {
        this.mintSelectionChanged({
          active: options.selectedMints,
          ...this.addedAndRemovedFromNewMintSelection(options.selectedMints)
        });
      } else this.mintSelectionChanged({ active: [], remoced: this.selectedMints });

      this.$refs.catalogFilter.resetFilters();
      this.$refs.catalogFilter.setFilters(options)



    },
    resetSettings() {
      this.overlay.settings.reset();
      this.$emit('reset');
    },
    dataUpdated(data) {
      this.catalog_filter_mixin_updateActive(this.$refs.catalogFilter, [
        'excludeFromMapApp',
        'mint',
        'yearOfMint',
      ]);

      this.drawTimeline()

      this.overlay.setData(data);
      this.overlay.repaint();
      this.save();
    },
    drawTimeline: async function () {
      const height = this.$refs.timeline.getTimeline().$el.offsetHeight;
      const filters = this.$refs.catalogFilter.getFilters()

      let otherFilters = Object.assign({}, filters)
      delete otherFilters['yearOfMint']
      delete otherFilters['excludeFromMapApp']

      const graphs = []
      const tickGraph = new TickGraph(this.timeline.from, this.timeline.to, {
        options: { longDash: 20 },
        contextStyles: { strokeStyle: Color.Black, lineWidth: 1 },
      })

      if (Object.keys(otherFilters).length <= 1 && otherFilters['mint'].length === 0) {
        graphs.push(tickGraph)
        this.$refs.timeline.$data.timelineChart.update({ data: [], graphs })
      } else {
        const data = await this.getTypePlot(filters)
        const ranges = Range.fromPointArray(data)
        const graph = new RangeGraph(ranges, { height: height, contextStyles: { fillStyle: Color.Gray } })
        graphs.push(graph)

        const yMax = data.reduce((acc, val) => Math.max(acc, val.y), 0)
        const lineGraph = new LineGraph(data, {
          edges: "line",
          yMax,
          yOffset: 20,
          contextStyles: { strokeStyle: "#bbb", lineWidth: 1, strokeLinecap: "round" },
          modules: [new NoDataModule()]
        })
        graphs.push(tickGraph)
        graphs.push(lineGraph)

        if (this.$refs.timeline.timelineChart) {
          this.$refs.timeline.$data.timelineChart.update({ data, graphs })
        }
      }
    },
    getTypePlot: async function (filters) {
      const points = await Query.raw(`query timelinePlot($filters: TypeFilter, $distinct: String){timelinePlotType(filters: $filters, distinct: $distinct) {
  x
  y
}}`, { filters, distinct: "mint" })

      return points.data.data.timelinePlotType

    },
    save() {
      this.catalog_filter_mixin_save(this.$refs.catalogFilter);
    },
    async updateMints() {
      await this.$refs.catalogFilter.search();
    },
    timelineChanged(value) {
      this.updateYearOverwrite(value);
      this.timeChanged(value);
    },
    timelineUpdated() { },
    updateTimeline: async function (initial = false) {
      const triggered = this.updateYearOverwrite(this.timeline.value);
      if (!triggered && !initial) this.update();
    },
    updateYearOverwrite(value) {
      const old = this.overwriteFilters.yearOfMint;
      if (this.timelineActive) {
        this.overwriteFilters.yearOfMint = value.toString();
      } else {
        this.overwriteFilters.yearOfMint = null;
      }
      return old !== this.overwriteFilters.yearOfMint;
    },
    timelineToggled: async function () {
      this.timeline_mixin_toggleTimeline()
      this.updateYearOverwrite(
        this.timelineActive ? this.timeline.value : null
      );
      this.update();
    },
    getMaterialOptions(material) {
      return {
        id: material?.id,
        name: material?.name,
        count: 1,
        fillColor: material?.color || '#222',
        fillOpacity: 1,
        color: 'white',
        weight: 1,
      };
    },
    getOptions() {
      let options = {}
      let filters = {}
      if (this.$refs.catalogFilter) {
        filters = this.$refs.catalogFilter.getURLParams()
      }
      options.selectedMints = this.selectedMints;
      options = Object.assign(options, this.getTimelineOptions(), this.getMapOptions(), filters)
      return options;
    },
    resetFilters: function () {
      this.$refs.catalogFilter.resetFilters();
      this.clearMintSelection({ preventUpdate: true });
      this.overwriteFilters.mint = this.selectedMints;
      this.update();
    },
    async update() {
      await this.updateMints();
      this.$emit('timeline-updated', this.value);
    },
  },
};
</script>

<style lang="scss">
.leaflet-popup .no-catalog-entry {
  opacity: 0.65;
  cursor: default;
}

.material-map {
  .catalog-filters {
    $smaller-input-pad: $small-padding 2 * $small-padding;

    .labeled-input-container {
      margin-bottom: 0.1em;
    }

    .radio-button {
      label {
        padding: $smaller-input-pad;
      }
    }

    label {
      font-size: $small-font;
      font-weight: normal;
      margin-bottom: 0.1em;
    }

    .three-way-toggle {
      min-height: 20px;
    }

    >* {
      grid-column: span 6;
    }
  }
}
</style>
