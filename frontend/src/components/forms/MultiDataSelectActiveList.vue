<template>
  <div class="active-list">
    <data-select-field
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
      @input="(val) => $emit('input', val)"
      @select="(val) => $emit('select', val)"
      @dynamic-change="() => $emit('dynamic-change')"
    />
    <template v-for="(el, idx) of items">
      <span
v-if="idx > 0"
:key="'ici-' + idx"
class="item-connection-indicator"
>AND</span>

      <button
:key="`active-${el.id}`"
@click="() => $emit('remove', el)"
>
        {{ el[attribute] }} <CloseThickIcon :size="10" />
      </button>
    </template>
  </div>
</template>

<script>
import CloseThickIcon from 'vue-material-design-icons/CloseThick.vue';
export default {
  components: {
    CloseThickIcon,
  },
  props: {
    items: { type: Array, required: true },
    attribute: { type: String, required: true },
  },
};
</script>

<style lang="scss">
.active-list {
  align-items: center;
  .material-design-icon {
    margin-left: $padding;
  }
}
</style>

<style lang="scss" scoped>
.active-list {
  display: flex;
  flex-wrap: wrap;
  background-color: white;
  border: 1px solid $light-gray;
  border-top: none;
  padding: $small-padding;

  border-bottom-left-radius: $border-radius;
  border-bottom-right-radius: $border-radius;

  button {
    margin: $small-padding/2;
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

    .material-design-icon {
      position: absolute;
      top: 2px;
      right: 2px;
      opacity: 0.5;
    }
  }
}
</style>