<template>
  <div class="popup-activator">
    <div
      class="popup-target"
      @click.stop.prevent="() => (active = !active)"
    >
      <slot :active="active">
        <!-- Popup activator / button / text -->
      </slot>
    </div>
    <popup
      :active="active"
      :target-width="targetWidth"
      :no-shadow="noShadow"
      @close="closePopup()"
    >
      <slot
        name="popup"
        :active="active"
      >
        <!-- Popup content -->
      </slot>
    </popup>
  </div>
</template>

<script>
import Popup from './Popup.vue';
export default {
  components: {
    Popup,
  },
  props: {
    targetWidth: Number,
    noShadow: Boolean,
  },
  data() {
    return {
      active: false,
    };
  },
  methods: {
    closePopup() {
      this.active = false;
    },
  },
};
</script>

<style lang='scss' scoped>
.popup-activator {
  position: relative;
}

.popup-anchor {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>