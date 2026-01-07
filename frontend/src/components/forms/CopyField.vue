<template>
  <div
    class="copy-field"
    @click="interact"
    @hover.stop.prevent
  >
    <div
      class="overlay"
      :class="{
        show: showOverlay,
      }"
    >
      <span class="text"><Locale path="events.copied" /></span>
    </div>
    <input
      ref="input"
      :value="value"
      readonly
    >
    <CopyIcon :size="IconSize.Tiny" />
  </div>
</template>

<script>
import CopyIcon from 'vue-material-design-icons/ContentCopy.vue';
import Locale from '../cms/Locale.vue';

export default {
  components: {
    CopyIcon,
    Locale
},
  props: {
    value: String,
  },
  data() {
    return {
      showOverlay: false,
      showTimeout: null,
    };
  },
  methods: {
    interact() {
      this.copy();
      this.animate();
    },
    copy($event) {
      let target = this.$refs.input;
      target.select();
      document.execCommand('copy');
      this.removeSelection();
    },
    animate() {
      if (this.showTimeout) clearTimeout(this.showTimeout);
      this.showOverlay = true;
      this.showTimeout = setTimeout(() => {
        this.showOverlay = false;
      }, 600);
    },
    removeSelection() {
      // Copied from this stackoverflow:
      // https://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
      if (window.getSelection) {
        if (window.getSelection().empty) {
          // Chrome
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
          // Firefox
          window.getSelection().removeAllRanges();
        }
      } else if (document.selection) {
        // IE?
        document.selection.empty();
      }
    },
  },
};
</script>

<style lang='scss' scoped>
.copy-field {
  display: flex;
  position: relative;

  box-sizing: border-box;
  border: 1px solid $gray;
  border-radius: $border-radius;
  cursor: pointer;
  transition: all 0.3s;

  >* {
    pointer-events: none;
    user-select: none;
  }

  &:hover {
    background-color: $dark-white;
  }

  &:active {
    color: white;
    background-color: $light-gray;
  }
}

input {
  display: block;
  flex: 1;

  cursor: pointer;
  border: none;
  background-color: transparent;
}

.overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  font-weight: bold;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  opacity: 0;

  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);

  .text {
    padding: $small-padding $padding;
    background-color: $white;
    color: $primary-color;
    border-radius: 10px;

    box-shadow: 0 0 5px rgba($color: #000, $alpha: 0.5);
    transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
  }
}

.material-design-icon {
  margin: 0 5px;
  color: $gray;
}

.overlay.show {
  opacity: 1;
  transform: translateY(-20px);

  .text {
    box-shadow: 0 20px 20px rgba($color: #000, $alpha: 0.5);
  }
}</style>