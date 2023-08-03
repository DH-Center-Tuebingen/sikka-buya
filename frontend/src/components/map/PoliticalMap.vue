<template>
  <div class="political-map ui">
    <div
      class="debug-window"
      v-if="showDebugWindow"
    >
      <h3>Debug-Window</h3>
    </div>

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
        :items="mintsList"
        :selectedIds="selectedMints"
        @selectionChanged="mintSelectionChanged"
      />
    </Sidebar>

    <div class="center-ui center-ui-top">
      <MapToolbar
        :filtersActive="filtersActive"
        @reset-filters="resetFilters"
      />
    </div>
    <div class="center-ui center-ui-center">
      <div
        class="unlocated-mints"
        v-if="filteredUnlocatedTypes.length > 0"
      >
        <header class="underlined-header">
          <h3 class="gray-heading"><i>nicht auf Karte:</i></h3>
        </header>
        <section
          v-for="obj of unlocatedTypesByMint"
          :key="`unlocated-${obj.mint.id}`"
          class="unlocated-mint-wrapper"
        >
          <h4>
            {{ obj.mint.name }}
          </h4>
          <div class="mint-grid grid col-3">


            <router-link
              v-for="typ of obj.types"
              :class="{ ['disabled-link']: typ.excludeFromTypeCatalogue }"
              target="_blank"
              :to="{ name: 'Catalog Entry', params: { id: typ.id } }"
              :key="`unlocated-mint-${typ.projectId}`"
            >{{ typ.projectId }}</router-link>
          </div>
        </section>
      </div>
    </div>
    <div class="center-ui center-ui-bottom">
      <TimelineSlideshowArea
        :map="map"
        ref="timelineSlideshowArea"
        :timelineFrom="timeline.from"
        :timelineTo="timeline.to"
        :timelineValue="raw_timeline.value"
        :valid="timelineValid"
        :shareLink="shareLink"
        :timelineActive="timelineActive"
        timelineName="political-map"
        @input="timeChanged"
        @toggle="toggleTimeline"
      >

        <template #left>
          <map-settings-box
            :iconSize="18"
            :open="overlaySettings.uiOpen"
            @toggle="toggleSettings"
            @reset="resetSettings"
          >
            <labeled-input-container label="Kreisgröße">
              <slider
                name="maxRadius"
                :value="overlaySettings.maxRadius"
                @input="overlaySettingsChanged"
                :min="overlaySettings.maxRadiusMinimum"
                :max="overlaySettings.maxRadiusMaximum"
              />
            </labeled-input-container>
          </map-settings-box>
        </template>
      </TimelineSlideshowArea>
    </div>

    <Sidebar side="right">
      <template #title>
        <Locale path="map.ruler_selection" />
      </template>

      <template #tools>
        <ListSelectionTools
          @select-all="() => { }"
          @unselect-all="clearRulerSelection"
          :hideSelectAllButton="true"
          :allSelected="false"
          :noneSelected="selectedRulers.length === 0"
        >
        </ListSelectionTools>
      </template>
      <ruler-list
        :selectedUnavailable="selectedUnavailableRulers"
        :unavailable="unavailableRulers"
        :items="availableRulers"
        :selectedIds="selectedRulers"
        :group="!timelineActive"
        @selectionChanged="rulerSelectionChanged"
      />
    </Sidebar>
  </div>
</template>

<script>
// Models
import Range from '../../models/timeline/range.js';
import Sequence from '../../models/timeline/sequence.js';
import Pattern from '../../models/draw/pattern';
import { PoliticalSlide } from '../../models/slide';


//Utils
import Sort from '../../utils/Sorter';
import Sorter from '../../utils/Sorter';

// Other
import Query from '../../database/query';

//Mixins
import map from './mixins/map';
import { mintLocationsMixin } from './mixins/MintLocationsMixin';
import settingsMixin from '../map/mixins/settings';
import timeline from './mixins/timeline';
import slideshow from '../mixins/slideshow';

// Components
import ButtonVue from '../layout/buttons/Button.vue';
import Checkbox from '../forms/Checkbox.vue';
import LabeledInputContainer from '../LabeledInputContainer.vue';
import ListSelectionTools from '../interactive/ListSelectionTools.vue';
import MapSettingsBox from '../MapSettingsBox.vue';
import MintList from '../MintList.vue';
import MultiSelectList from '../MultiSelectList.vue';
import Notification from '../Notification.vue';
import RulerList from '../RulerList.vue';
import ScrollView from '../layout/ScrollView.vue';
import Sidebar from './Sidebar.vue';
import Slider from '../forms/Slider.vue';
import TimelineSlideshowArea from './TimelineSlideshowArea.vue';

// Icons
import SettingsIcon from 'vue-material-design-icons/Cog.vue';
import ExitIcon from 'vue-material-design-icons/ExitToApp.vue';

// Other
import PoliticalOverlay from '../../maps/PoliticalOverlay';
import Settings from '../../settings.js';
import URLParams from '../../utils/URLParams.js';
import Color from '../../utils/Color.js';
import Locale from '../cms/Locale.vue';
import MapBackButton from './control/MapBackButton.vue';
import MapToolbar from './MapToolbar.vue';
import { RangeGraph, LineGraph, StackedRanges } from '../../models/timeline/TimelineChart';

let settings = new Settings(window, 'PoliticalOverlay');
const overlaySettings = settings.load();

let selectedRulers;

try {
  const json = localStorage.getItem('map-rulers');
  let parsedRulerSelection = JSON.parse(json);

  if (!Array.isArray(parsedRulerSelection))
    throw new Error(
      'Saved ruler selection was not an array',
      parsedRulerSelection
    );

  selectedRulers = parsedRulerSelection.filter(
    (item) => item != null && !isNaN(item)
  );
} catch (e) {
  console.warn(
    'Could not load selected rulers. This is normal on first start of the app.'
  );
} finally {
  if (!selectedRulers) selectedRulers = [];
}

export default {
  name: 'PoliticalMap',
  components: {
    ButtonVue,
    Checkbox,
    ExitIcon,
    LabeledInputContainer,
    ListSelectionTools,
    MapSettingsBox,
    MintList,
    MultiSelectList,
    RulerList,
    ScrollView,
    SettingsIcon,
    Sidebar,
    Slider,
    TimelineSlideshowArea,
    Notification,
    Locale,
    MapBackButton,
    MapToolbar
  },
  data: function () {
    return {
      showDebugWindow: false,
      availableRulers: [],
      data: null,
      mints: [],
      overlay: null,
      patterns: {},
      persons: {},
      rulerListStyles: [],
      rulers: [],
      selectedRulers,
      addedRulers: [],
      removedRulers: [],
      unavailableRulers: [],
      selectedUnavailableRulers: [],
      unlocatedTypes: [],
      types: [],
    };
  },
  mixins: [
    map,
    timeline,
    slideshow,
    settingsMixin(overlaySettings),
    mintLocationsMixin({
      onMintSelectionChanged: async function () {
        await this.drawTimeline();
      },
    }),
  ],
  computed: {
    timelineChart() {
      return this.$refs.timelineSlideshowArea.timelineChart
    },
    shareLink() {
      return URLParams.generate(this.getOptions()).href;
    },
    filters() {
      return {
        person: this.selectedRulers,
        yearOfMint: this.timelineActive ? this.timeline.value.toString() : null,
        mint: this.selectedMints,
      };
    },
    selections() {
      return {
        selectedRulers: {
          active: this.selectedRulers,
          removed: this.removedRulers,
          added: this.addedRulers,
        },
        selectedMints: {
          active: this.selectedMints,
          removed: this.removedMints,
          added: this.addedMints,
        },
      };
    },
    filtersActive: function () {
      return this.selectedRulers.length > 0 || this.selectedMints.length > 0;
    },
    mintsList() {
      function addAvailability(mint, available) {
        mint.available = available;
        return mint;
      }

      let sorted = [
        ...this.availableMints
          .filter((mint) => mint)
          .map((mint) => addAvailability(mint, true)),
        ...this.unavailableMints
          .filter((mint) => mint)
          .map((mint) => addAvailability(mint, false)),
      ];

      sorted = sorted
        .filter((mint) => mint?.province?.id)
        .sort(Sorter.stringPropAlphabetically('name'));

      return sorted;
    },
    filteredUnlocatedTypes() {
      return this.unlocatedTypes.filter((type) => {
        const mintId = type?.mint?.id ? type.mint.id : 0;

        if (
          this.selectedMints.length > 0 &&
          this.selectedMints.indexOf(mintId) === -1
        ) {
          return false;
        } else {
          return true;
        }
      });
    },
    unlocatedTypesByMint() {
      const mintMap = {};

      this.filteredUnlocatedTypes.forEach((type) => {
        const mintId = type?.mint?.id ? type.mint.id : 0;

        if (!mintMap[mintId]) {
          mintMap[mintId] = {
            mint:
              mintId === 0
                ? { id: 0, name: 'ohne Münzstättenangabe' }
                : type.mint,
            types: [],
          };
        }

        mintMap[mintId].types.push(type);
      });

      for (let obj of Object.values(mintMap)) {
        obj.types.sort(Sorter.stringPropAlphabetically('projectId'));
      }
      return Object.values(mintMap).sort(
        Sorter.stringPropAlphabetically('mint.name')
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
      this.repaint();
    });

    this.overlay = new PoliticalOverlay(this.featureGroup, settings, {
      onDataTransformed: (transformedData, filters) => {
        this.mints = transformedData.mints;
        this.unavailableMints = transformedData.unavailableMints;
        this.availableMints = transformedData.availableMints;
        this.persons = transformedData.persons;
        this.rulers = transformedData.rulers;
        this.unlocatedTypes = transformedData.unlocatedTypes;

        this.updateAvailableRulers();
      },
    });
  },
  mounted: async function () {
    this.$nextTick(() => {
      URLParams.clear();
    });

    let selectedRulers = URLParams.getArray('selectedRulers');
    if (selectedRulers) {
      this.rulerSelectionChanged({ active: selectedRulers, added: selectedRulers }, {
        added: selectedRulers,
        preventUpdate: true,
      });
    }

    let selectedMints = URLParams.getArray('selectedMints');
    if (selectedMints) {
      this.mintSelectionChanged(
        { active: selectedMints, added: selectedMints },
        {
          preserveSelections: true,
          preventUpdate: true,
        }
      );
    }

    await this.initTimeline();
    await this.update();
    await this.drawTimeline();

    this.addedMints = []
  },
  beforeDestroy: function () {
    if (this.mintLocations) this.mintLocations.clearLayers();
  },
  methods: {
    toggleTimeline() {
      timeline.methods.toggleTimeline.call(this);
      this.drawTimeline()
      this.$nextTick(() => {
        this.update();
      });
    },
    slideshowSlidesLoaded({ slides, slideshow }) {

      // TODO: This is a hack to make sure the mints are loaded before we apply the display options
      setTimeout(() => {
        let updatedSlides = slides.slice()

        updatedSlides = updatedSlides.map((slide) => {
          slide = PoliticalSlide.formatDisplay(slide, this.mints)
          return slide
        })

        slideshow.updateSlides(updatedSlides)

      }, 300);
    },
    requestSlideOptions({ slideshow, index, overwrite } = {}) {
      let { options, display } = this.applyDisplayOptionToLoadedSlides()
      slideshow.createSlide({ options, index, overwrite, display });
    },
    applyDisplayOptionToLoadedSlides() {
      const options = this.getOptions();
      return PoliticalSlide.formatDisplay({ name: "", options }, this.mints)
    },
    // We moved this from the computed property to a method because it is
    // dependend on the map and is not notified when the map changes (move/zoom).
    getOptions() {
      let options = {};
      options.selectedRulers = URLParams.toStringArray(this.selectedRulers);
      options.selectedMints = URLParams.toStringArray(this.selectedMints);
      options = Object.assign(options, this.getTimelineOptions(), this.getMapOptions());
      return options;
    },
    async drawTimeline() {

      if (!this.$data.i) this.$data.i = 1
      if (this.timelineChart) {
        let graphs = []
        if (this.selectedMints.length > 0 && this.selectedRulers.length > 0) {
          const rulerGraphs = await this.drawRulersOntoTimeline(true);
          const mintGraphs = await this.drawMintCountOntoTimeline(
            rulerGraphs.map((graph) => graph.data)
          );

          graphs = [...mintGraphs, ...rulerGraphs]

        } else if (this.selectedMints.length > 0) {
          graphs = await this.drawMintCountOntoTimeline();

        } else if (this.selectedRulers.length > 0) {
          graphs = await this.drawRulersOntoTimeline();

        } else {
          this.timelineChart.clear()
        }

        this.timelineChart.update({ graphs })

      }

    },
    async drawRulersOntoTimeline(drawAsHorizontals = false) {
      const result = await Query.raw(
        `{
              timelineRuledBy(rulers: [${this.selectedRulers.join(
          ','
        )}], mints: [${this.selectedMints.join(',')}]){
                  ruler {color},
                  data
              }
       ruledMintCount(rulers: [${this.selectedRulers.join(
          ','
        )}], mints: [${this.selectedMints.join(',')}]){
         ruler {id name color}
          data {x, y}
      }
      }`
      );

      const {
        ruledMintCount,
        timelineRuledBy,
      } = result.data.data

      const graphs = []
      let max = 0
      const yOffset = 20
      if (drawAsHorizontals) {
        const lineHeight = 5;
        const padding = Math.ceil(lineHeight / 2);
        let allSelectedRulerRanges = [];

        ruledMintCount.forEach((rulerObj) => {
          let rulerYearArr = rulerObj.data.slice().map((obj) => obj.x);
          const rulerRangeArr = Range.fromNumberSequence(rulerYearArr);
          allSelectedRulerRanges.push({
            ruler: rulerObj.ruler,
            range: rulerRangeArr.slice(),
          });
        });

        allSelectedRulerRanges.sort((a, b) => {
          return (
            Range.getWidthFromRanges(b.range) -
            Range.getWidthFromRanges(a.range)
          );
        });

        allSelectedRulerRanges.forEach((rangeObj, index) => {
          graphs.push(new StackedRanges(rangeObj.range, { y: (lineHeight + padding) * (index + 1), contextStyles: { strokeStyle: rangeObj.ruler.color, lineWidth: lineHeight } }))
        });
      } else {
        ruledMintCount.forEach(({ ruler, data }) => {
          //TODO: Normally data should be delivered in a irdered fasion
          data = data.sort((a, b) => a.x - b.x)
          let graph = new LineGraph(data, { yOffset, contextStyles: { strokeStyle: ruler.color, lineWidth: 2 } })
          const graphMax = data.reduce((prev, cur) => {

            if (cur.y > prev) prev = cur.y
            return prev
          }, -Infinity)

          if (graphMax > max) max = graphMax

          graphs.push(graph)
        })

        graphs.forEach((graph) => {
          graph.set("yMax", max)
        })

        //// This was for creating horizontal lines to make the
        //// line graph easier to undertand. But it adds too 
        //// much clutter to the graph.

        // const horizontals = []
        // const step = Math.ceil(max / 6)
        // for (let i = step; i <= max; i+=step) {
        //   horizontals.push({ x: 0, y: i })
        // }
        // let horizontalGraph = new HorizontalLinesGraph(horizontals, { yOffset, yMax: max, contextStyles: { strokeStyle: "#e3e3e3", lineWidth: 1 } })

        // graphs.unshift(horizontalGraph)

      }


      const andGraph = []
      if (this.selectedRulers.length > 1) {
        andGraph.push(this.drawStripedAndBlock(timelineRuledBy))
      }


      return [...andGraph, ...graphs]


      // this.timelineChart.updateTimeline(this.raw_timeline);

      // const timelineRuledBy = result.data.data.timelineRuledBy;

      // if (this.selectedRulers.length > 1)
      //   this.drawStripedAndBlock(timelineRuledBy);

      // let ranges = [];

      // if (drawAsHorizontals) {
      //   const rulerLines = () => {
      //     const lineHeight = 5;
      //     const padding = Math.ceil(lineHeight / 2);
      //     let allSelectedRulerRanges = [];

      //     rulerPointArrays.forEach((rulerObj) => {
      //       let rulerYearArr = rulerObj.data.slice().map((obj) => obj.x);
      //       const rulerRangeArr = Range.fromNumberSequence(rulerYearArr);
      //       allSelectedRulerRanges.push({
      //         ruler: rulerObj.ruler,
      //         range: rulerRangeArr.slice(),
      //       });
      //     });

      //     allSelectedRulerRanges.sort((a, b) => {
      //       return (
      //         Range.getWidthFromRanges(b.range) -
      //         Range.getWidthFromRanges(a.range)
      //       );
      //     });

      //     let yPos = 0;
      //     allSelectedRulerRanges.forEach((rangeObj) => {
      //       yPos += lineHeight + padding;
      //       this.timelineChart.drawRangeLineOnCanvas(rangeObj.range, yPos, {
      //         lineCap: 'butt',
      //         lineWidth: lineHeight,
      //         strokeStyle: rangeObj.ruler.color,
      //       });
      //     });

      //     return allSelectedRulerRanges;
      //   };

      //   ranges = Range.union(rulerLines().map((el) => el.range));
      // } else {
      //   let max = 0;
      //   Object.values(rulerPointArrays).forEach(({ ruler, data }) => {
      //     const c_max = data.reduce((prev, cur) => {
      //       const value = cur.y;
      //       return value > prev ? value : prev;
      //     }, -Infinity);

      //     if (c_max > max) max = c_max;
      //   });

      //   rulerPointArrays.forEach(({ ruler, data }) => {
      //     this.timelineChart.drawGraphOnTimeline(
      //       data,
      //       {
      //         strokeStyle: ruler.color + 'aa',
      //         lineWidth: 2,
      //         fillStyle: 'transparent',
      //       },
      //       {
      //         max,
      //       }
      //     );
      //   });
      // }

      // return ranges;
    },
    drawStripedAndBlock(timelineRuledBy) {
      let combinedRanges = Range.fromNumberSequence(timelineRuledBy.data);

      var fillStyle = this.timelineChart
        .getContext()
        .createPattern(
          Pattern.createLinePattern(
            [Color.Gray, Color.hexBrighten(Color.Gray, 0.5)],
            10
          ),
          'repeat'
        );



      const rangeGraph = new RangeGraph(combinedRanges, {
        contextStyles: {
          fillStyle,
          fillOpacity: 0.5,
        }
      })

      return rangeGraph
    },
    timelineUpdated: async function () {
      this.update();
    },
    resetFilters: function () {
      this.rulerSelectionChanged(
        { active: [], remove: this.selectedRulers },
        { preventUpdate: true }
      );
      this.mintSelectionChanged(
        { active: [], remove: this.selectedMints },
        { preventUpdate: true }
      );
      this.update();
    },
    async update() {
      this.setLoading(true);
      await this.overlay.update({
        filters: this.filters,
        selections: this.selections,
      });
      this.setLoading(false);
    },
    repaint() {
      if (this.overlay) {
        this.overlay.repaint({
          filters: this.filters,
          selections: this.selections,
        });
      }
    },
    applySlide(options = {}) {
      if (options.zoom && options.location) {
        let location = URLParams.fromStringArray(options.location);
        this.map.flyTo(location, options.zoom);
      }
      if (options.selectedRulers) {
        this.selectedRulers = URLParams.fromStringArray(options.selectedRulers);
      } else this.selectedRulers = [];

      if (options.selectedMints) {
        let active = URLParams.fromStringArray(options.selectedMints);
        let added = [];
        let removed = [];
        this.selectedMints.forEach((mintId) => {
          if (active.indexOf(mintId) == -1) {
            removed.push(mintId);
          } else {
            added.push(mintId);
          }
        });

        this.mintSelectionChanged({ active, added, removed });
      } else {
        this.mintSelectionChanged({ active: [] });
      }

      if (options.year && options.year != 'null') {
        this.timeChanged(options.year);
      }

      if (options.timelineActive != null) {
        if (this.timelineActive != options.timelineActive)
          this.toggleTimeline();
      }
    },
    updateAvailableRulers() {
      let selectedRulers = this.selectedRulers.slice();

      this.availableRulers = Object.values(this.rulers).sort(
        Sort.stringPropAlphabetically('shortName')
      );

      // We remove the heirs from the list if timeline is deactivated,
      // as they are not displayed there.
      if (this.timelineActive == false) {
        this.availableRulers.filter(p => {
          const role = p.role
          if (role) {
            return role.name !== "heir"
          } else return true
        })
      }

      /**
       * If a ruler is selected but not in the timeline anymore:
       */
      this.selectedUnavailableRulers = [];
      selectedRulers.forEach((selectedRuler) => {
        if (!this.rulers[selectedRuler]) {
          const person = this.persons[selectedRuler];
          if (person)
            this.selectedUnavailableRulers.push(this.persons[selectedRuler]);
          else
            throw new Error(
              'Invalid user in selected ruler list!',
              selectedRuler
            );
        }
      });
      this.selectedUnavailableRulers.sort(
        Sort.stringPropAlphabetically('shortName')
      );
    },
    clearMintSelection() {
      this.mintSelectionChanged({ active: [], removed: this.selectedMints });
    },
    clearRulerSelection(preventUpdate = false) {
      this.rulerSelectionChanged([], preventUpdate);
    },
    getRulerColor(ruler) {
      return ruler.color || '#ff00ff';
    },
    updateAvailableMints() { },
    rulerSelectionChanged(selected, preventUpdate = false) {
      this.selectedRulers = selected.active || [];

      try {
        localStorage.setItem('map-rulers', JSON.stringify(this.selectedRulers));
      } catch (e) {
        console.warn(e);
      }

      if (!preventUpdate) {
        this.updateAvailableRulers();
        this.repaint();
        this.drawTimeline()
      }
    },
    async drawMintCountOntoTimeline(ranges) {
      const val = await Query.raw(`{
      typeCountOfMints(ids: [${this.selectedMints.join(',')}]){
          data {x, y}
      }
    }`)

      let data = val.data.data.typeCountOfMints.reduce((prev, cur) => {
        return prev.concat(cur.data);
      }, []);

      const height = 100
      let andGraphs = []
      if (ranges) {

        //Filter for or chart
        data = data.filter(point => {
          let flatRanges = ranges.reduce((prev, cur) => {
            return prev.concat(cur)
          }, [])
          for (let range of flatRanges) {
            if (point.x >= range[0] && point.x <= range[1]) return true
          }
          return false
        });

      }

      let graph = new RangeGraph(Range.fromPointArray(data), {
        height, contextStyles: {
          fillStyle: Color.Gray
        }
      })
      return [graph, ...andGraphs]

    },
  }
}
</script>

<style  lang="scss" >
.political-map.ui {
  .notice {
    $margin: 100px;
    position: absolute;
    top: 75px;
    left: 50%;
    margin: 0 $margin;
    box-sizing: border-box;
    transform: translateX(calc(-50% + #{-$margin}));
    width: 420px;
    max-width: calc(100% - 4 *#{$padding});
  }

  nav {
    display: flex;
    flex-direction: column;
  }
}
</style>

<style lang="scss" scoped>
.debug-window {
  padding: $padding;
  bottom: 0;
  left: 0;
  position: fixed;
  background-color: white;
  border: 1px solid $yellow;
  min-width: 200px;
  min-height: 100px;
  z-index: 1000000;
}

.unlocated-mints {
  position: absolute;
  pointer-events: all;
  left: $padding ;
  bottom: 0;
  color: $white;
  background-color: rgba($white, 0.8);
  width: 260px;
  border-radius: $border-radius;
  border: 1px solid $light-gray;
  backdrop-filter: blur(2px);

  h3 {
    font-size: 1em;
  }
}

h4 {
  margin: 0;
  font-size: $regular-font;
  color: $gray;
  padding-bottom: $padding;
}

.unlocated-mint-wrapper {
  padding: $big-padding;
  font-size: $small-font;
}
</style>


