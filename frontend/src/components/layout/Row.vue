<template>
  <div class="flex row">
    <slot></slot>
  </div>
</template>


<script>
export default {
  name: 'LayoutRow',
};
</script>

<style lang="scss">
.row.reverse {
  flex-direction: row-reverse;
}

.row.align-start {
  justify-items: flex-start;
}

.row.align-end {
  justify-items: flex-end;
}

.row.space-between {
  justify-content: space-between;
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.row {
  display: flex;
  align-items: center;

  > * {
    flex: 1;
    &:not(:last-child) {
      margin-right: $padding * 2;
    }
  }
}
</style> 

