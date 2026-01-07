<template>
  <div class="box">
    <header>
      <h2 v-if="title">
{{ title }}
</h2>
      <slot name="header" />
    </header>
    <div class="body">
      <slot />
    </div>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Box',
  props: {
    title: String,
  },
};
</script>

<style lang="scss">
.box .body {

  .box-row,
  >*:not(:last-child) {
    margin-bottom: $padding * 1.5;
  }
}
</style>

<style lang="scss" scoped>
$side-pad: $padding * 4;

$top-bottom-spacing: math.div($side-pad, 2);

h2 {
  padding-top: 0.5em;
  text-align: center;
}

header {
  position: relative;

  >* {
    margin-top: 0;
  }

  &:after {
    content: "";
    display: block;
    border-bottom: 6px dotted $dark-white;
    margin: $large-padding 0;
  }
}

footer {
  margin-top: 4* $padding;
}

.body {
  // padding: 0 $side-pad math.div($side-pad, 2) $side-pad;

  :first-child {
    margin-top: 0;
  }


}

.box {
  max-width: 100%;
  @include box;
  margin: 0 $side-pad;

  width: 320px;
  max-width: 100%;
}
</style>