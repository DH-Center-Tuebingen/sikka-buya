<template>
  <div class="catalog-list">
    <div class="property-label">
{{ label }}
</div>
    <ul>
      <li
v-for="(item, idx) of items"
:key="`${item}-${idx}`"
>
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "CatalogList",
  props: {
    label: String,
    items: Array,
  },
};
</script>

<style lang="scss">

.property-label {
  font-weight: bold;
  color: $primary-color;
}
</style>
