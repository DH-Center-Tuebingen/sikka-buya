<template>
  <toggle
    class="completed-toggle"
    :class="{ readonly: readonly, active: toggleValue }"
    :readonly="readonly"
    :value="toggleValue"
    @input="clicked"
  >

    <template v-slot:active>
      <component
        :is="icon"
        :size="18"
        class="active"
      />
    </template>
    <template v-slot:inactive>
      <component
        :is="icon"
        :size="18"
      />
    </template>
  </toggle>
</template>


<script>
import Toggle from './Toggle.vue';

export default {
  name: 'CompletedButton',
  components: {
    Toggle,
  },
  props: {
    icon: String,
    value: Boolean,
    readonly: Boolean,
  },
  methods: {
    clicked(event) {
      if (!this.readonly) this.$emit('input', event)
    }
  },
  computed: {
    toggleValue() {
      if (!this.value) return false;
      else return this.value;
    },
  },
};
</script>

<style lang="scss">
.completed-toggle {
  &.button>.active {
    color: $white;
  }
}
</style>

<style lang="scss" scoped>
.completed-toggle {
  display: flex;
  align-items: center;
  width: 30px;
  height: 30px;
  margin: 3px;

}

.readonly {
  color: $light-gray;

  .active {
    color: $blue;
  }
}
</style>