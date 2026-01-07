<template>
  <div class="multi-data-select">
    <div class="content">
      <div class="active-list">
        <div class="data-select-wrapper placeholder" />

        <template v-for="(el, index) of active">
          <button
            :key="`active-${el.id}`"
            @click="() => $emit('remove', el, index)"
          >
            {{ el[attribute] }}
            <CloseThickIcon
              class="closeButton"
              :size="10"
            />
          </button>
        </template>
      </div>
    </div>

    <div
      v-if="mode"
      class="mode-indicator"
      :class="{ interactive: allowModeChange }"
      @click="changeMode"
    >
      <Locale :path="`general.${mode.toLowerCase()}`" />
    </div>

    <div
      ref="dataSelectWrapper"
      class="data-select-wrapper"
      @click="showDataSelect"
    >
      <div class="icon">
        <PlusIcon :size="18" />
      </div>

      <data-select-field
        ref="dataSelect"
        :value="value"
        :error="error"
        :query-body="queryBody"
        :additional-parameters="additionalParameters"
        :table="table"
        :attribute="attribute"
        :required="required"
        :text="text"
        :display-text-callback="displayTextCallback"
        :query="query"
        :query-command="queryCommand"
        :msg="msg"
        :tooltip="tooltip"
        :placeholder="placeholder"
        :unselectable="true"
        :disable-remove-button="disableRemoveButton"
        :style="dataSelectStyles"
        @blur="hideDataSelect"
        @input="(val) => $emit('input', val)"
        @select="select"
        @dynamic-change="() => $emit('dynamic-change')"
      />
    </div>
  </div>
</template>

<script>
import DataSelectField from './DataSelectField.vue';
import CloseThickIcon from 'vue-material-design-icons/CloseThick.vue';
import PlusIcon from 'vue-material-design-icons/Plus.vue';
import Locale from '../cms/Locale.vue';

export default {
  components: {
    CloseThickIcon,
    PlusIcon,
    DataSelectField,
    Locale
  },
  props: {
    active: {
      type: Array,
      required: true,
    },
    error: String,
    queryBody: {
      type: Array,
      default: function () {
        return ['id', 'name'];
      },
    },
    additionalParameters: Object,
    table: {
      type: String,
    },
    attribute: {
      type: String,
      default: 'name',
    },
    required: Boolean,
    // Text allows us to format the text as we want to.
    // This is an alternative to attribute.
    // Use JavaScript template literals placeholders ('${your_variable}')
    text: String,
    displayTextCallback: Function,
    /**
     * Unselectable is used, when you e.g. have multiple selection options and the
     * field is cleared afterwards and only the selection is tracked.
     */
    query: String,
    queryCommand: String,
    msg: String,
    tooltip: String,
    placeholder: { type: String, default: 'Suche...' },
    disableRemoveButton: {
      type: Boolean,
      default: false,
    },
    mode: String,
    allowModeChange: Boolean,
  },
  data() {
    return {
      value: null,
      dataSelectVisible: false,
    };
  },
  computed: {
    dataSelectStyles() {
      let style = {
        display: 'none',
      };

      if (this.dataSelectVisible) {
        delete style.display;
      }

      return style;
    },
  },
  created() {
    this.resetValue();
  },
  methods: {
    changeMode() {
      if (this.allowModeChange) this.$emit('change-mode');
    },
    resetValue() {
      this.value = { id: null, [this.attribute]: '' };
    },
    select(val) {
      this.resetValue();
      this.$emit('select', val);
    },
    showDataSelect() {
      this.$refs.dataSelectWrapper.classList.add('active');
      setTimeout(() => {
        this.dataSelectVisible = true;
        this.$nextTick(() => this.$refs.dataSelect.focus());
      }, 400);
    },
    hideDataSelect() {
      this.dataSelectVisible = false;
      this.$refs.dataSelectWrapper.classList.remove('active');
    },
  },
};
</script>

<style lang="scss">
$min-height: 24px;

.multi-data-select {
  display: flex;
  position: relative;
  border: $border;
  border-radius: $border-radius;
  min-height: $min-height;

  button:not(.add-button) {
    margin: math.div($small-padding, 2);
    font-size: $small-font;
    border-radius: $border-radius;
    // border: none;
    padding: 2px;
    // padding: $small-padding $padding;
    // background-color: $primary-color;
    // color: white;
    font-weight: bold;
    position: relative;
    padding-right: 12px;
    word-break: break-all;
    overflow-wrap: break-word;

    .closeButton {
      position: absolute;
      top: 50%;
      right: 2px;
      opacity: 0.5;
      transform: translateY(-50%);
    }
  }

  .active-list {
    align-items: center;

    .closeButton {
      margin-left: $padding;
    }
  }

  .data-select {
    position: absolute;
    top: 0;
    width: 100%;

    .name-field {
      padding-left: 24px;
      background-color: transparent;

      &:hover {
        background-color: transparent;
      }

      &:active {
        background-color: transparent;
      }
    }
  }

  input {
    max-width: 100%;
  }
}
</style>



<style lang="scss" scoped>
.content {
  flex: 1;
}

.active-list {
  display: flex;
  flex-wrap: wrap;
  // background-color: white;
  // border: 1px solid $light-gray;
  border-top: none;
  padding: $small-padding;

  border-bottom-left-radius: $border-radius;
  border-bottom-right-radius: $border-radius;
}

.item-connection-indicator,
.mode-indicator {
  font-size: $xtra-small-font;
  font-weight: bold;
  user-select: none;
  text-transform: uppercase;
}

.mode-indicator {
  display: flex;
  align-items: center;
  padding: $small-padding;
  margin-left: $small-padding;
  border-top-right-radius: $border-radius;
  border-bottom-right-radius: $border-radius;
  color: $gray;

  &.interactive {
    background-color: $dark-green;

    min-width: 32px;
    justify-content: center;

    color: $white;
    cursor: pointer;
    @include interactive();
    @include mouseeffects();
  }
}

.data-select-wrapper {
  position: absolute;
  $max-size: 28px;
  $size: 20px;
  $offset: math.div(($max-size - $size), 2);
  height: $size;
  width: $size;
  top: $offset;
  left: $offset;
  border-radius: $border-radius;
  background-color: white;
  border: $border;
  display: flex;
  align-items: center;
  transition: all 0.3s;

  .icon {
    color: gray;
    margin-left: 1px;
    opacity: 1;
    // transition: opacity 0.3;
  }

  &.placeholder {
    position: static;
    visibility: hidden;
  }

  &.active {
    top: 0;
    left: 0;
    width: 100%;
    height: 31px;
    transform: translate(-2px, -2px);

    z-index: 1;

    .icon {
      opacity: 0.5;
    }
  }
}
</style>