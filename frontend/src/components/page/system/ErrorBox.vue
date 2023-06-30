<template>
  <div
    class="global error-box"
    :class="type"
    v-if="show"
  >
    <Icon
      :path="iconPath"
      type="mdi"
      :size="IconSize.Normal"
    />
    <slot>
    </slot>
    <!-- <div
      class="button transparent-button interactive"
      @click.stop.prevent="() => (message = '')"
    >
      <Close />
    </div> -->
  </div>
</template>

<script>
import IconMixin from "@/components/mixins/icon-mixin"
import { mdiAlertCircleOutline, mdiInformationOutline, mdiAlert } from "@mdi/js"


const options = ["info", "warn", "error"]
export default {
  name: "ErrorBox",
  mixins: [IconMixin({ error: mdiAlertCircleOutline, info: mdiInformationOutline, warn: mdiAlert })],
  props: {
    type: {
      type: String,
      default: "error",
      validator(value) {
        return options.includes(value)
      }
    },
  },
  computed: {
    iconPath() {
      console.log(this.icons)
      return this.icons[this.type]
    },
    show() {
      return this.$slots.default
    }
  }
};
</script>

<style lang="scss" scoped>
.error-box {
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: $regular-font;
  min-width: 400px;
  padding: $padding;

  &.error {
    background-color: $red;
  }

  &.warn {
    background-color: $yellow;
  }

  &.info {
    background-color: $blue;
  }
}

svg {
  margin-right: .5em;
}



.button {
  margin-left: auto;
  color: $white;
}
</style>
