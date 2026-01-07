<template>
  <router-link
:to="to"
class="sikka-buya-button button"
target="_blank"
>
    <img src="/image/logos/sikka-buya-icon-only.svg">
    <slot />
  </router-link>
</template>

<script>
export default {
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
  },
};
</script>

<style lang='scss' scoped>
$height: 26px;
.sikka-buya-button {
  height: $height;
  border-radius: math.div($height, 2);
  color: $black;
  border-color: $primary-color;
  padding-right: $padding * 3;
  font-weight: normal;
  font-size: $small-font;
}

img {
  display: block;
  height: 100%;
  margin-right: $padding;
}
</style>