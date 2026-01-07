<template>
  <div class="breadcrumbs">
    <span
      v-for="match in matched"
      :key="match.name"
      class="crumb"
    >

      <router-link :to="match">
        <Locale :path="`routes.${match.name}`" />
      </router-link>
    </span>
  </div>
</template>

<script>
import Locale from '../cms/Locale.vue';

export default {
  components: { Locale },
  props: {
    before: { type: Array, defaultValue: [] }
  },
  computed: {

    matched() {
      const matched = this.$route.matched.filter((r) => r.name);
      const parts = [...this.before];
      if (matched.length > 0) {
        for (let i = 1; i < matched.length; i++) {
          const match = matched[i];
          const last = matched[i - 1];
          if (last?.redirect?.name) {
            const matchRedir = match.name.replace("/", "");
            const lastRedir = last.redirect.name.replace("/", "");
            if (lastRedir !== matchRedir) {
              parts.push(last);
            }
          }
          else {
            parts.push(last);
          }
        }
        parts.push(matched[matched.length - 1]);
      }
      return parts;
    },
  }
};
</script>

<style lang="scss" scoped>
$crumb-background-color: $white;

.breadcrumbs {
  position: relative;
  padding: $padding;
  display: flex;
  max-width: 100%;
  overflow-y: auto;
}

.crumb {
  $crumb-size: 15px;

  @mixin common {
    content: '';
    height: 0;
    display: inline-block;
    border: $crumb-size solid transparent;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  margin-left: -12px;

  a {
    display: inline-flex;
    align-items: center;
    color: $gray;
    background-color: $crumb-background-color;
    padding: $padding 3 * $padding;

    height: $crumb-size * 2;
    box-sizing: border-box;
  }

  // &:first-child {
  //   a {
  //     padding-left: 3 * $padding;
  //   }
  // }

  &:not(:first-child) {
    &:before {
      @include common;
      border-right-width: 0;
      border-top-color: $crumb-background-color;
      border-bottom-color: $crumb-background-color;
    }
  }

  &:after {
    @include common;
    border-right-width: 0;
    border-left-color: $crumb-background-color;
  }

  &:last-child {
    a {
      color: $green;
    }

    &:after {
      @include common;
      border-right-width: $crumb-size;
      border-color: $crumb-background-color;
      border-top-right-radius: $crumb-size;
      border-bottom-right-radius: $crumb-size;
    }
  }
}
</style>