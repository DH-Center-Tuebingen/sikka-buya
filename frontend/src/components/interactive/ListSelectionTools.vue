<template>
  <div class="list-selection-tools">
    <div
      v-if="!hideSelectAllButton"
      @click.prevent.stop="selectAll"
      :class="{ disabled: allSelected }"
    >
      <Icon type="mdi" :path="icons.mdiSelectAll" :size="iconSize" />
    </div>
    <div
      @click.prevent.stop="unselectAll"
      :class="{ disabled: noneSelected }"
    >
      <Icon type="mdi" :path="icons.mdiSelectOff" :size="iconSize" />
    </div>
  </div>
</template>

<script>

import iconMixin from '@/components/mixins/icon-mixin.js'; 
import {mdiSelectAll, mdiSelectOff} from '@mdi/js/mdi';

export default {
  mixins: [iconMixin({ mdiSelectAll, mdiSelectOff })],
  props: {
    allSelected: { type: Boolean, required: true },
    noneSelected: { type: Boolean, required: true },
    hideSelectAllButton: Boolean,
  },
  data(){
    return {
      iconSize: 18,
      unselectIcon: mdiSelectOff,
      selectAllIcon: mdiSelectAll
    }
  },
  methods: {
    selectAll() {
      if (!this.allSelected) this.$emit('select-all');
    },
    unselectAll() {
      if (!this.noneSelected) this.$emit('unselect-all');
    },
  },
};
</script>

<style lang='scss' scoped>
.list-selection-tools {
  display: flex;
}
</style>