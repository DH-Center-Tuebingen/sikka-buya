<template>
  <div
v-if="$store.state.user"
class="editor-toolbar"
>
    <header>
      <ShieldAccountIcon />
      Kurator Bereich
    </header>

    <div class="tools">
      <slot />
    </div>
  </div>
</template>

<script>
import ShieldAccountIcon from 'vue-material-design-icons/ShieldAccount.vue';
export default {
  components: {
    ShieldAccountIcon,
  },
};
</script>

<style lang="scss" scoped>
.editor-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: $light-gray;
  padding: $padding;
  margin-bottom: $padding;
  border-radius: $border-radius;
}

.tools {
  display: flex;
  flex: 1;
  justify-content: flex-end;
}

header {
  display: flex;
  align-items: center;
  color: whitesmoke;
  > * {
    margin-right: $padding;
  }
}
</style>