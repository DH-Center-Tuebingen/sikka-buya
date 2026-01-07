<template>
  <div
v-if="active"
class="modal"
@click="close"
>
    <div
class="modal-content"
@click.stop=""
>
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close: function () {
      this.$emit("close");
    },
  },
};
</script>


<style lang="scss" scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

  display: flex;
  background-color: rgba($color: #000000, $alpha: 0.5);
  align-items: center;
  justify-content: center;

  z-index: 1000000;
}

.modal-content {
  min-width: 120px;
  min-height: 120px;

  max-width: 90%;
  max-height: 90%;
}
</style>