<template>
  <div
    :class="'info ' + type"
    :hidden="hidden"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Info',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => {
        return ['info', 'error', 'warning'].indexOf(value) != -1;
      },
    },
    alwaysShow: {
      default: false,
      type: Boolean,
    },
    trigger: {
      default: 0,
      type: Number,
    },
    time: {
      type: Number,
      default: 0,
    },
  },
  data: function () {
    return {
      trigger_show: false,
    };
  },
  watch: {
    trigger: function () {
      this.show();
    },
  },
  methods: {
    show: function () {
      if (this.trigger_show == false) {
        this.trigger_show = true;
        if (this.$props.time > 0) {
          setTimeout(this.hide, this.$props.time);
        }
      }
    },
    hide: function () {
      this.trigger_show = false;
    },
  },
  computed: {
    visible() {
      return this.alwaysShow || this.trigger_show;
    },
    hidden() {
      return !this.visible;
    },
  },
};
</script>

<style lang="scss" scoped>
.info {
  color: white;
  background-color: gray;
  font-weight: bold;
  font-style: italic;
  padding: $padding;
  width: 100%;
  font-size: $small-font;
  box-sizing: border-box;
  text-align: center;
  border-radius: $small-border-radius;
}

.warning {
  background-color: $orange;
}

.error {
  background-color: $red;
}
</style>
