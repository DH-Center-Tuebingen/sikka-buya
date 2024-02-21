<template>
  <div
    class="slideshow"
    ref="slideshow"
  >
    <scroll-view>
      <div
        class="slides"
        ref="slides"
      >
        <new-slide @click.native="requestSlide()" />
        <template v-for="(slide, idx) of slides">
          <slide
            :key="`slide-${idx}`"
            :number="Number(idx) + 1"
            :display="slide.display"
            :options="slide.options"
            :class="{ active: idx === currentSlide }"
            @select="setSlide(idx)"
          />
          <new-slide
            :key="`new-slide-${idx}`"
            @click.native="requestSlide(idx + 1)"
          />
        </template>
      </div>
    </scroll-view>
    <div class="tool-bar">

      <div
        v-for="button in controls"
        class="button icon-button"
        @click="button.action"
        :key="`action-button-${button.icon}}`"
        :title="button.hotkey ? `${button.name} (${button.hotkey})` : button.name"
      >
        <Icon
          type="mdi"
          :path="button.icon"
          :size="iconSize"
        />
        <Locale
          v-if="button.name"
          :path="`slideshow.${button.name}`"
        />
      </div>
    </div>
  </div>
</template>

<script>
import NewSlide from './slides/NewSlide.vue';
import Slide from './slides/Slide.vue';
import ScrollView from '../../layout/ScrollView.vue';
import Locale from '../../cms/Locale.vue';
import HotkeyMixin from '../../mixins/hotkey';
import Hotkeyed from '../../interactive/Hotkeyed.vue';

import Icon from "@jamescoyle/vue-icon"
import {
  mdiCameraOutline,
  mdiDelete,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiSync,
  mdiExport,
  mdiImport
} from '@mdi/js';

const storagePostFix = '-slideshow';

export default {
  mixins: [HotkeyMixin(
    {
      'PageUp': "prevSlide",
      'PageDown': "nextSlide",
    }
  )],
  components: {
    Slide,
    NewSlide,
    ScrollView,
    Icon,
    Locale,
    Hotkeyed
  },
  props: {
    storagePrefix: String,
  },
  data() {
    return {
      slides: [],
      slideId: 0,
      currentSlide: 0,
      iconSize: 18,
      controls: [
        {
          icon: mdiSkipPrevious,
          action: this.prevSlide,
          hotkey: this.$t('key.page_up')
        },
        {
          name: "override",
          icon: mdiSync,
          action: this.overrideSlide,
        }, {
          name: "delete",
          icon: mdiDelete,
          action: this.removeSlide,
        },
        {
          name: "record",
          icon: mdiCameraOutline,
          action: this.requestSlide,
        },
        {
          name: "import",
          icon: mdiImport,
          action: this.importSlideshow,
        },
        {
          name: "export",
          icon: mdiExport,
          action: this.exportSlideshow,
        },
        {
          icon: mdiSkipNext,
          action: this.nextSlide,
          hotkey: this.$t('key.page_down')
        }
      ]
    };
  },
  mounted() {
    this.registerEventListener()
    this.loadSlides()
  },
  beforeDestroy() {
    this.removeEventListener()
  },
  methods: {
    registerEventListener() {
      this.scrollContent.addEventListener('wheel', this.scroll);
    },
    removeEventListener() {
      this.scrollContent.removeEventListener('wheel', this.scroll);
    },
    importSlideshow() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = JSON.parse(e.target.result);
          if (data.type === this.storagePrefix) {
            this.slides = data.slides;
            this.currentSlide = data.currentSlide;
            this.slideChanged();
          } else {
            alert('Invalid file type');
          }
        }
        reader.readAsText(file);
      }
      input.click();
    },
    exportSlideshow() {
      const dataString = JSON.stringify({
        type: this.storagePrefix,
        slides: this.slides,
        currentSlide: this.currentSlide,
      })

      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sikka-buya_${this.storagePrefix}_${(new Date().toISOString().slice(0, -5))}.json`;
      a.click();
    },
    loadSlides() {
      if (this.storagePrefix) {

        try {
          this.slides =
            JSON.parse(window.localStorage.getItem(this.storageName)) || [];

          // We need to wait for next tick for other components to be mounted
          this.$nextTick(() => {
            this.$root.$emit('slides-loaded', { slideshow: this, slides: this.slides });
          })

        } catch (e) {
          console.warn(
            'Could not load slideshow from localStorage. This warning is normal when no slideshow was saved.'
          );
        }
      }
    },
    updateSlides(slides) {
      this.slides = slides
      this.saveSlides();
    },
    getName(slide) {
      if (slide?.options?.year) {
        return slide.options.year === 'null' ? null : slide.options.year;
      } else {
        return null;
      }
    },
    scroll(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      const scroll = evt.deltaY;
      const sensitivity = 0.3;
      const scrollLeft = this.scrollContent.scrollLeft;
      this.scrollContent.scrollLeft = scrollLeft + scroll * sensitivity;
    },
    overrideSlide() {
      this.requestSlide(this.currentSlide, true)
    },
    requestSlide(index, overwrite) {
      this.$root.$emit('request-slide-options', {
        slideshow: this,
        index,
        overwrite,
      });
    },
    createSlide({ options = {}, index = null, overwrite = false, display = {} }) {
      const slide = {
        name: null,
        options,
        display
      };

      if (index == null) this.slides.push(slide);
      else {
        const deleteCount = overwrite ? 1 : 0;
        this.slides.splice(index, deleteCount, slide);
      }

      this.currentSlide = index == null ? this.slides.length - 1 : index;
      this.slideChanged();
    },
    nextSlide() {
      const length = this.slides.length;
      if (length > 0) {
        if (this.currentSlide < 0 || this.currentSlide >= length - 1)
          this.currentSlide = 0;
        else {
          this.currentSlide += 1;
        }
      }
      this.updateSlide();
    },
    prevSlide() {
      const length = this.slides.length;
      if (length > 0) {
        if (this.currentSlide <= 0) this.currentSlide = length - 1;
        else {
          this.currentSlide -= 1;
        }
      }
      this.updateSlide();
    },
    updateSlide() {
      if (this.currentSlide >= 0 && this.currentSlide < this.slides.length) {
        this.$root.$emit('apply-slide', this.slides[this.currentSlide].options);
      } else console.warn('Slide index is out of range.');
    },
    setSlide(index) {
      this.currentSlide = index;
      this.updateSlide();
    },
    removeSlide(index) {
      if (index == null) index = this.currentSlide;
      if (index === this.slides.length - 1) {
        this.currentSlide = this.slides.length - 2;
      }

      this.slides.splice(index, 1);
      this.slideChanged();
    },
    slideChanged() {
      this.saveSlides();
    },
    saveSlides() {
      if (this.storagePrefix) {
        localStorage.setItem(this.storageName, JSON.stringify(this.slides));
      } else throw new Error('No storage prefix set.');
    }
  },
  computed: {
    scrollContent() {
      return this.$refs.slideshow.querySelector('.simplebar-content-wrapper');
    },
    storageName() {
      return this.storagePrefix + storagePostFix;
    },
  },
};
</script>
<style lang='scss'>
.slideshow {
  .slideshow-item {
    flex-shrink: 0;
  }
}
</style>
<style lang='scss' scoped>
.slideshow {
  background-color: whitesmoke;
  border-radius: $border-radius;
  display: flex;
  overflow-x: clip;
  overflow-y: visible;
  border: $border;
  display: flex;
  flex-direction: column;


  &:focus {
    outline: $primary-color;
  }
}

.slides {
  display: flex;
  justify-content: flex-start;
  margin: $padding;
  margin-bottom: 2 * $padding;

  >* {
    margin-right: math.div($padding, 2);

  }

  &:after {
    content: "";
    display: block;
    flex-shrink: 0;
    width: $small-padding;
  }
}

.tool-bar {
  display: flex;
  background-color: $white;

  >* {
    flex: 1;
  }
}

.icon-button .text {
  display: none;
}

@include media-min-desktop() {
  .icon-button .text {
    display: inline;
  }
}

.icon-button {
  color: $gray;
  padding: 0px;
  border-radius: 0;
  box-sizing: border-box;
  border-color: $dark-white;

  &:not(:last-child) {
    border-right-width: 0;
  }

  &:hover {
    color: $black;
  }
}
</style>