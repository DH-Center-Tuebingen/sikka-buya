<template>
  <div class="person-view">
    <catalog-property>
      <template #label>
        <locale
path="typeview.issuer"
:count="2"
/>
      </template>
      <div>
        <person-list
:value="issuers"
:class="multipleIssuersClass"
/>
      </div>
    </catalog-property>
    <catalog-property>
      <template #info>
        <locale path="typeview.overlord_info" />
      </template>
      <template #label>
        <locale
path="typeview.overlords"
:count="2"
/>
      </template>
      <person-list :value="overlords" />
    </catalog-property>

    <div
class="caliph-group"
:class="{ 'col-2': hasPerson(heir) }"
>
      <catalog-property>
        <template #label>
          <locale path="typeview.caliph" />
        </template>
        <person-list :value="caliph" />
      </catalog-property>

      <catalog-property
v-if="hasPerson(heir)"
class="heir-grid"
>
        <template #label>
          <locale path="typeview.heir" />
        </template>
        <person-list :value="heir" />
      </catalog-property>
    </div>
  </div>
</template>

<script>
import CatalogProperty from '../catalog/CatalogProperty.vue';
import Locale from '../cms/Locale.vue';
import PersonList from './PersonList.vue';
export default {
  components: { Locale, PersonList, CatalogProperty },
  props: {
    overlords: Array,
    issuers: Array,
    caliph: Object,
    heir: Object,
  },
  computed: {
    multipleIssuersClass() {
      return this.issuers.length > 1 ? 'issuer-grid' : null;
    },
  },
  methods: {
    dynamicHeading(singular, plural, array) {
      return array?.length == 1 ? singular : plural;
    },
    hasPerson(persons) {
      return !(
        persons == null ||
        (persons.length != null && persons.length === 0)
      );
    },
  },
};
</script>

<style lang="scss">
.person-view {
  .caliph-group .catalog-property {
    background-color: transparent;
  }
  .issuer-grid ul {
    display: grid;
    gap: $padding * 3;
    grid-template-columns: 1fr 1fr;
  }

  ul {
    margin: 0;
  }
}
</style>

<style lang="scss" scoped>
.heir-grid {
  border: 1px dotted $primary-color;
  padding: $small-padding $padding;
  margin: math.div($padding, 2) $padding;
}

.caliph-group {
  display: grid;
  gap: $padding;
  background-color: $white;
}
</style>