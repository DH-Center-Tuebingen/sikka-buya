<template>
  <div
class="collapsible"
:class="collapsibleClasses"
>
    <header
class="collapsible-header"
@click="toggleCollapse"
>
      <slot name="header" />

      <div class="icon">
        <ChevronUp v-if="!collapsed" />
        <ChevronDown v-if="collapsed" />
      </div>
    </header>

    <div
v-if="!collapsed"
class="collapsible-content"
>
      <slot />
    </div>
  </div>
</template>

<script>
import ChevronUp from 'vue-material-design-icons/ChevronUp';
import ChevronDown from 'vue-material-design-icons/ChevronDown';

export default {
  name: 'Collapsible',
  components: {
    ChevronUp,
    ChevronDown,
  },
  props: {
    collapsed: Boolean,
  },
  computed: {
    collapsibleClasses() {
      return this.collapsed ? 'collapsed' : 'open';
    },
  },
  methods: {
    toggleCollapse: function () {
      this.$emit('toggled', !this.collapsed);

      if (this.collapsed) {
        this.$emit('close');
      } else {
        this.$emit('open');
      }
    },
  },
};
</script>

<style lang="scss">
.collapsible header {
  h4 {
    margin: $small-padding 0 !important;
    padding: math.div($padding, 2) $padding !important;
  }
}
</style>

<style lang="scss" scoped>
.collapsible {
  border-bottom: $border;
}

.collapsible header {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  position: relative;
}

.collapsible-content {
  min-height: 1rem;
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
