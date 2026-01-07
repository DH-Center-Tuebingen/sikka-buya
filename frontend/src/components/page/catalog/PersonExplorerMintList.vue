<template>
  <div class="person-explorer-mint-list">
    <h6>Prägeort(e)</h6>

    <div
      v-for="yearObject of validYearObjects"
      :key="getKey(yearObject)"
      class="mint-row"
    >
      <span class="year-title">{{ yearObject.value }}:</span>

      <toggle-button-list
        :list="getSortedPersonList(yearObject.asIssuer)"
        :active="activeIssuers(yearObject.value)"
        @change="(mint) => changed(yearObject.value, mint, false)"
      />
      <overlord-separator
        v-if="getSortedPersonList(yearObject.asOverlord).length > 0"
        :appended="getSortedPersonList(yearObject.asIssuer).length > 0"
      />
      <toggle-button-list
        :list="getSortedPersonList(yearObject.asOverlord)"
        :active="activeOverlords(yearObject.value)"
        @change="(mint) => changed(yearObject.value, mint, true)"
      />
    </div>
    <span
v-if="!hasActive"
class="hint"
>Wählen Sie einen Prägeort!</span>
  </div>
</template>

<script>
import Sort from '../../../utils/Sorter';
import OverlordSeparator from './OverlordSeparator.vue';
import ToggleButtonList from './ToggleButtonList.vue';

export default {
  components: { ToggleButtonList, OverlordSeparator },
  props: {
    yearObjectArray: { type: Array, required: true },
    activeYears: { type: Object, required: true },
  },
  computed: {
    validYearObjects() {
      return this.yearObjectArray.filter((obj) => {
        if (!obj) console.error('Invalid yearObjectArray: ', obj);
        return !!obj;
      });
    },
    hasActive() {
      for (let yearObject of Object.values(this.activeYears)) {
        for (let key of ['activeOverlordsMints', 'activeIssuerMints'])
          if (Object.keys(yearObject[key]).length > 0) return true;
      }
      return false;
    },
  },
  methods: {
    toggleActive(obj) {
      obj.active = !obj.active;
    },
    changed(year, mint, rulerType) {
      this.$emit('change', year, mint, rulerType);
    },
    activeMints(year, isOverlord = false) {
      let activeMints;
      if (isOverlord)
        activeMints = this.activeYears?.[year]?.activeOverlordsMints;
      else activeMints = this.activeYears?.[year]?.activeIssuerMints;
      return activeMints;
    },
    getSortedPersonList(personObject, prop = 'value') {
      return Object.values(personObject)
        .map((obj) => obj[prop])
        .sort(Sort.stringPropAlphabetically('name'));
    },
    activeIssuers(year) {
      return this.activeYears[year].activeIssuerMints;
    },
    activeOverlords(year) {
      return this.activeYears[year].activeOverlordsMints;
    },
    getKey(yearObject) {
      if (!yearObject || !yearObject.value)
        console.warn('Invalid yearObject: ', yearObject);

      return `mint-of-year-${yearObject?.value}`;
    },
  },
};
</script>

<style lang="scss">
.person-explorer-mint-list {
  button {
    margin: 3px;
  }
}
</style>


<style lang="scss" scoped>
.year-title {
  margin-right: $padding;
  font-weight: bold;
  font-size: 1.1rem;
}
</style>