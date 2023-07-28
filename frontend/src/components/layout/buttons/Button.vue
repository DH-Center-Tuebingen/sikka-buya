<template>
  <button
    class="button"
    :disabled="disabled"
    :type="type"
    :class="{ colored, multiline, 'content-button': contentButton, active: active, disabled }"
    @click="clicked"
  >
    <!-- 
      @slot Default slot to render the button contents.
     -->
    <slot v-if="!to" />
    <router-link
      v-else
      :to="to"
    >
      <slot />
    </router-link>
  </button>
</template>

<script>
/**
 * Renders a more pleasant looking and more customizable Button.
 * __This button should be used as default!__
 *
 * An Exception would be if you want to submit a form.
 */
export default {
  props: {
    /**
     * Contentbutton doesn't use a filling, it just uses the
     * buttons content. Most likely a single icon.
     */
    contentButton: Boolean,
    /**
     * Disables the button and the ability to push it.
     */
    disabled: Boolean,
    /**
     * Displays the button in the accent color.
     */
    colored: Boolean,
    /**
     * Displays multiple elements below each other.
     */
    multiline: Boolean,
    /**
     * You can just put the to in the button to get a navigation going.
     */
    to: Object,
    /**
     * Prevent the default stopPropagation
     */
    noStop: Boolean,
    type: String,
    active: Boolean
  },
  methods: {
    /**
     * Called when the button is clicked.
     */
    clicked: function (event) {

      if (!this.noStop)
        event.stopPropagation()

      if (!this.disabled)
        /**
         * Click event.
         */
        this.$emit('click');
    },
  },
};
</script>

<style lang="scss">
.button {
  box-sizing: border-box;
  $disabled-color: $light-gray;

  svg {
    display: block;
  }

  >.icon:first-child,
  >svg:first-child:not(:last-child) {
    margin-right: .5em;
  }

  &[disabled] {
    color: $disabled-color;
    border: 1px solid $disabled-color;

    background-color: transparent;
    cursor: not-allowed;
  }

  &.row-button {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    border-top: $border;
    border-bottom: $border;
  }



  &.map-button {
    color: $white;
    font-weight: 600;
    font-size: 0.8rem;

    $background-alpha: 0.4;

    background-color: rgba($color: $white, $alpha: $background-alpha);
    backdrop-filter: blur(1px) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
    border: rgba($color: $white, $alpha: 0.8) 1px solid;
    $text-shadow: 0 0 3px rgba($color: $black, $alpha: 0.8);
    text-shadow: $text-shadow;

    &.disabled {
      opacity: 0.5;
      $disabled-color: white;
      color: $disabled-color;
      border: 1px solid $disabled-color;
    }

    &.active {
      background-color: rgba($color: $primary-color, $alpha: $background-alpha);
    }

    >svg {
      filter: drop-shadow($text-shadow);

      &:not(:last-child) {
        margin-right: $padding;
      }
    }

    a {
      font-weight: bold;
    }
  }

  &.big-button {
    padding: $padding $padding * 2;
  }

  &.huge-button {
    padding: $large-padding $large-padding * 2;
    font-size: $large-font;

    .material-design-icon {
      margin-right: $large-padding;
    }
  }

  a {
    @include resetLinkStyle();
    color: currentColor;
  }
}
</style>

<style lang="scss" scoped>
.button {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  box-sizing: border-box;

  a {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    box-sizing: border-box;
    flex: 1;
  }

  &.multiline {
    flex-direction: column;
  }

  .material-design-icon:not(:last-child) {
    margin-right: $padding;
  }

  &.colored {
    border-radius: 3px;

    @include buttonColor($white, $primary-color);
  }

  &.content-button {
    background-color: transparent;
    border: none;
  }

  &.borderless {
    background-color: transparent;
    border: none;
    border-radius: 0;
  }

  a {
    display: block;
  }
}
</style>
