<template>
  <div class="tree-view">
    <TreeItem
      v-for="twig in children"
      :key="twig.id"
      :twig="twig"
      :class="{inline: twig.inline}"
      @select="selected($event)"
    />
  </div>
</template>

<script>
import TreeItem from "./TreeItem.vue";

export default {
  name: "TreeView",
  components: {
    TreeItem,
  },
  props: {
    children: {
      required: true,
      type: Array,
    },
    loadChildren: Object,
  },
  data: function () {
    return {
      collapsed: true,
    };
  },
  methods: {
    selected: function (data) {
      this.$emit("select", data);
    },
  },
};
</script>

<style lang="scss" scoped>
.tree-item {
  margin-left: 50px;
}

</style>
