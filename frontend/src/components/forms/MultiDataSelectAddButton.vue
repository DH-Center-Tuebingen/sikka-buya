<template>
  <button
    class="multi-data-select-add-icon button add-button"
    style="min-width: 20px"
  >
    <Icon type="mdi" :path="icons.mdiPlus" :size="16" />
    <slot> </slot>
  </button>
</template>

<script>
import Plus from 'vue-material-design-icons/Plus';
import IconsMixin from '../mixins/icon-mixin.js';
import { mdiPlus } from '@mdi/js';

export default {
  components: {
    Plus,
  },
  mixins: [IconsMixin({mdiPlus})]
};
</script>

<style lang='scss' >
.multi-data-select-add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $small-font;
  width: 100%;

  svg {
    margin-right: 0.25em;
  }

}
</style>