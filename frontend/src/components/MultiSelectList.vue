<template>
  <div class="multi-select-list">
    <ul>
      <slot />
    </ul>
  </div>
</template>

<style lang="scss">
.multi-select-list {
  // .select-list-item {
  //   display: grid;
  //   grid-template-columns: 30px 1fr;

  //   & > *:not(.checkbox) {
  //     align-self: center;
  //   }
  // }

  .hidden {
    visibility: hidden;
  }

  .grayedOut {
    opacity: 0.3;
    background-color: gray;
  }

  .nonInteractive {
    pointer-events: none;
  }
}
</style>