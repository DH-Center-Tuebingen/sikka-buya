<template>
  <div class="cms-status-indicator">
    <Icon
      v-if="pending"
      type="mdi"
      :path="icons.loading"
      :size="size"
      class="pending-icon"
    />
    <Icon
      v-else
      type="mdi"
      :class="dirty ? 'dirty-icon' : 'check-icon'"
      :path="dirty ? icons.exclamation : icons.check"
      :size="size"
    />

  </div>
</template>

<script>
import iconMixin from '../../mixins/icon-mixin';
import LoadingSpinner from '../../misc/LoadingSpinner.vue';

import { mdiCheckBold, mdiExclamationThick, mdiLoading } from "@mdi/js"

export default {
  mixins: [iconMixin({ check: mdiCheckBold, exclamation: mdiExclamationThick, loading: mdiLoading })],
  components: { LoadingSpinner },
  props: {
    size: {
      type: Number,
      default: 16,
    },
    pending: Boolean,
    dirty: Boolean,
  },
};
</script>

<style lang="scss" scoped>
.cms-status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  color: $green;
  // filter: drop-shadow(0 0 3px rgba(125, 255, 125));

}


.pending-icon {
  padding: 0;
  animation: spin 1s linear infinite;
}
</style>