<template>
  <div
v-if="Array.isArray(value)"
class="catalog-item"
>
    <catalog-list
:label="label"
:items="value"
/>
  </div>
  <div
v-else
class="catalog-item"
>
    <catalog-property
:label="label"
:value="value"
/>
  </div>
</template>

<script>
import CatalogList from "./CatalogList.vue";
import CatalogProperty from "./CatalogProperty.vue";
export default {
  name: "CatalogItem",
  components: { CatalogList, CatalogProperty },
  props: {
    label: String,
    value: {
      validator: function(el) {
        return Array.isArray(el) || typeof el === "string";
      },
    },
  },
};
</script>

