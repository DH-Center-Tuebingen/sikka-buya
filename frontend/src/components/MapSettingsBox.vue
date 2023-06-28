<template>
  <PopupActivator
    :targetWidth="280"
    :noShadow="true"
    class="settings"
  >
    <template v-slot="{ active }">
      <ButtonVue
        class="map-button"
        :active="active"
        :noStop="true"
      >

        <Icon
          type="mdi"
          :path="icons.mdiCog"
          :size="iconSize"
        />
      </ButtonVue>
    </template>

    <template v-slot:popup>
      <h3>Einstellungen</h3>
      <slot />
      <ButtonVue
        class="small-button"
        @click="resetSettings"
      >
        <Icon
          type="mdi"
          :path="icons.mdiRestart"
          :size="iconSize"
        />
        Standard wiederherstellen
      </ButtonVue>
    </template>
  </PopupActivator>
</template>

<script>
import Locale from './cms/Locale.vue';
import ButtonVue from './layout/buttons/Button.vue';
import PopupActivator from './Popup/PopupActivator.vue';

import Icon from "./mixins/icon-mixin.js"
import { mdiCog, mdiRestart } from '@mdi/js';

export default {
  mixins: [Icon({ mdiCog, mdiRestart })],
  components: {
    PopupActivator,
    Locale,
    ButtonVue
  },
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    iconSize: {
      type: Number,
      default: 22,
    }
  },
  methods: {
    resetSettings() {
      this.$emit('reset');
    },
    toggleSettings() {
      this.$emit('toggle');
    },
  },
};
</script>

<style lang="scss">
.settings {


  .reset-icon {
    padding-right: $padding;
  }


  .small-button {
    width: 100%;
  }

  label {
    font-size: $small-font;
  }
}
</style>