<template>
  <div class="list-filter-container">
    <header @click="toggleCollapse">
      <span>Filter</span>

      <div class="icon">
        <Plus v-if="collapsed" />
        <Minus v-if="!collapsed" />
      </div>
    </header>

    <div v-if="!collapsed" class="list-filter-container-content">
      <slot />
    </div>
    <div v-if="filtered" class="message" @click="$emit('clearFilters')">
      <AlertCircleOutline /> {{ $t('general.filter_active') }}
    </div>
  </div>
</template>

<script>
import Plus from 'vue-material-design-icons/Plus';
import Minus from 'vue-material-design-icons/Minus';
import AlertCircleOutline from 'vue-material-design-icons/AlertCircleOutline';

export default {
  name: 'ListFilterContainer',
  components: {
    Plus,
    Minus,
    AlertCircleOutline,
  },
  props: {
    filtered: Boolean,
  },
  data: function () {
    return {
      collapsed: true,
    };
  },
  methods: {
    toggleCollapse: function () {
      this.collapsed = !this.collapsed;
    },
  },
};
</script>

<style lang="scss" scoped>
.list-filter-container {
  border: 1px solid #ccc;
  border-radius: 3px;
}

.message {
  cursor: pointer;
  user-select: none;
  font-size: $small-font;
  padding: math.div($padding, 3) $padding;
  text-align: center;
  background-color: $primary-color;
  color: whitesmoke;
  display: flex;
  align-items: center;
  justify-content: center;
  .material-design-icon {
    width: 16px;
    height: 16px;
    padding-right: $padding;
  }
}

header {
  background-color: white;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
}

header,
.list-filter-container-content {
  padding: 10px;
}

.list-filter-container-content > *:not(:last-child) {
  margin-bottom: 10px;
}

.icon {
  margin-left: auto;
}

.material-design-icon {
  display: block;
  display: flex;
  align-items: center;
}
</style>
