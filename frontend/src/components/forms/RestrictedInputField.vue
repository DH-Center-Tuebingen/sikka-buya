<template>
  <div class="restricted-input">
    <input
type="text"
:value="value"
@input="validateInput"
>
    <div class="empty">
      <Info
:trigger="trigger"
:time="3000"
type="warning"
class="info"
>
Es sind nur Werte zwischen -999 und 999 erlaubt. Es kann auch 'x'
        angegeben werden.
      </Info>
    </div>
  </div>
</template>

<script>
import Info from './Info.vue';
export default {
  name: 'RestrictedInputField',
  components: { Info },
  props: {
    value: String,
    pattern: {
      type: String,
      required: true,
    },
  },
  data: function () {
    return {
      oldValue: '',
      trigger: 0,
    };
  },
  methods: {
    validateInput: function (event) {
      if (!event.target.value.match(new RegExp(this.$props.pattern))) {
        this.$data.trigger++;
        event.target.value = this.$data.oldValue;
      } else {
        this.$data.oldValue = event.target.value;
        this.$emit('input', event.target.value);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.restricted-input {
  position: relative;
  display: flex;
  flex-direction: column;
}

.info {
  position: absolute;
}
</style>
