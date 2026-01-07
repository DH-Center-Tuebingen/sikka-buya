<template>
  <div class="list-item-cell">
    <router-link
v-if="to"
:to="to"
class="text"
>
      <slot />
    </router-link>
    <div
v-else
class="text"
>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    to: Object,
  },
  methods: {
    click: function () {
      if (!this.disable) {
        if (this.to) {
          this.$router.push(this.to);
        } else this.$emit('click');
      }
    },
  },
};
</script>


<style lang="scss" scoped>
.list-item-cell {
  // @include interactive;
  flex: 1;

  display: flex;
  // align-items: center;

  a {
    @include interactive;
    flex: 1;
    color: $black;
    display: flex;
    align-items: center;
  }

  a:hover {
    background-color: #fafafa;
  }
}
</style>