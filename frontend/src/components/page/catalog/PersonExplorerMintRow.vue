<template>
  <div class="person-explorer-mint-row">
    <span class="year-title">{{ year }}:</span>

    <toggle-button-list
      :list="issuerMints"
      :active="{}"
      @change="(mint) => changed(yearObject.value, mint, false)"
    />
    <overlord-separator
      v-if="overlordMints.length > 0"
      :appended="issuerMints.length > 0"
    />
    <toggle-button-list
      :list="overlordMints"
      :active="{}"
      @change="(mint) => changed(yearObject.value, mint, false)"
    />
  </div>
</template>

<script>
import OverlordSeparator from './OverlordSeparator.vue';
import ToggleButtonList from './ToggleButtonList.vue';

export default {
  components: { ToggleButtonList, OverlordSeparator },
  props: {
    year: String,
    selectedYears: Array,
    tree: Object,
    selectedIssuerMints: Array,
  },
  methods: {},
  computed: {
    issuerMints() {
      let issuerTree = this.tree.issuerTree;
      let list = [];
      if (issuerTree && issuerTree[this.year]) {
        list = Object.keys(issuerTree[this.year]);
      }

      // let obj = this.tree?.issuerTre[this.year] || {};
      // let list = Object.keys(obj);
      return list;
    },
    overlordMints() {
      let overlordTree = this.tree.overlordTree;
      let list = [];
      if (overlordTree && overlordTree[this.year]) {
        list = Object.keys(overlordTree[this.year]);
      }

      // let obj = this.tree?.issuerTre[this.year] || {};
      // let list = Object.keys(obj);
      return list;
    },
  },
};
</script>
