<template>
  <div class="tabulated">
    <header>
      <div
        v-for="(tab, idx) of tabs"
        :key="`tab-${idx}-${tab}`"
        :class="{ 'tab-header': true, active: active == idx }"
        @click="changeTab(idx)"
      >
        {{ tab }}
      </div>
    </header>
    <div class="body">
      <slot :name="active + 1" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tabs: Array,
  },
  data: function () {
    return {
      active: 0,
    };
  },
  methods: {
    changeTab: function (index) {
      this.active = index;
    },
  },
};
</script>

<style lang="scss" scoped>
.tabulated {
  width: 500px;

  header {
    display: flex;
    > * {
      flex: 1;
      background-color: rgb(41, 41, 41);

      border: none;
      border-radius: 2px;
      &.active {
        background-color: #333;
      }
    }
  }

  .body {
    background-color: #333;
    padding: 20px;
  }
}
</style>
