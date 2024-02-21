<template>
  <div
    class="popup-anchor"
    v-if="active"
    :class="{ ['no-shadow']: noShadow }"
  >
    <div
      class="popup-translator"
      ref="translator"
      :style="{ width: targetWidth + 'px' }"
    >
      <div
        class="popup"
        ref="popup"
        @click.stop
      >
        <slot />
        <Button
          class="close-button"
          :contentButton="true"
          @click.native.stop="close"
        >
          <CloseButton :size="16" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import CloseButton from 'vue-material-design-icons/Close.vue';
import Button from '../layout/buttons/Button.vue';

export default {
  name: 'Popup',
  components: {
    CloseButton,
    Button,
  },
  props: {
    active: Boolean,
    targetWidth: { type: Number, default: 450 },
    noShadow: Boolean,
  },
  data: function () {
    return {
      offsetRight: 0,
      offsetLeft: 0,
    };
  },
  watch: {
    active: function (newValue, oldValue) {
      if (newValue != oldValue) {
        if (newValue == true) {
          this.opened();
          this.$nextTick(() => {
            this.keepInWindow();
          });
        } else this.closed();
      }
    },
  },
  created: function () {
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
  },
  destroy: function () {
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    opened() {
      this.$root.$emit('popup-opened', this);
    },
    closed() {
      this.$root.$emit('popup-closed', this);
    },
    close() {
      this.$emit('close');
    },
    resize: function () {
      this.keepInWindow.call(this);
    },
    keepInWindow: function () {
      if (this.$refs.popup) {
        let rect = this.$refs.popup.getBoundingClientRect();
        let whitespace = 20;

        const rightside = window.innerWidth - whitespace;

        if (rect.right > rightside) {
          this.offsetRight = rightside - rect.right;
        } else {
          this.offsetRight = 0;
        }

        let rightCss = parseInt(-this.offsetRight) + 'px';
        this.$refs.popup.style.right = rightCss;

        const leftside = whitespace;

        if (rect.left < leftside) {
          this.offsetLeft = leftside - rect.left;
        } else {
          this.offsetLeft = 0;
        }

        let leftCss = parseInt(this.offsetLeft) + 'px';

        this.$refs.popup.style.left = leftCss;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.popup> :first-child {
  margin-top: 0;
}

.popup-anchor:not(.no-shadow) {
  filter: drop-shadow($strong-shadow);
}

$color: $white;

.popup {
  position: absolute;
  bottom: 0;
  min-height: 2rem;
  background-color: $color;
  color: $black;
  border-radius: $border-radius;

  font-size: $small-font;
  line-height: $small-font * 1.5;

  padding: $padding;
  padding-right: 26px;

  z-index: 1000;
}

.popup-translator {
  position: absolute;
  min-height: 100px;

  transform: translate(-50%, -100%);
  top: -$padding;
  //   left: 50%;

  box-sizing: border-box;
}

.popup-anchor::before {
  content: '';
  width: 15px;
  height: 15px;
  transform: translateX(-50%) translateY(-120%) rotate(45deg);
  display: block;
  position: absolute;
  top: 0;

  background-color: $color;
}

.close-button {
  position: absolute;
  right: 0;
  top: 0;
  padding: $small-padding;
}
</style>