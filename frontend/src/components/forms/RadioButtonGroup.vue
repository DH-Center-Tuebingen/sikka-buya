<template>
  <Row
    class="radio-button-group button-group"
    :id="id"
  >
    <Row
      v-for="(option, idx) in options"
      v-bind:key="option.toString()"
      class="radio-button"
    >

      <input
        type="radio"
        :checked="value == option"
        :name="id"
        :id="option"
        @click="change"
      />
      <label
        v-if="useTlabels"
        :for="option"
        tabindex="0"
      >
        <span>
          <Locale :path="tlabels[idx]" />
        </span>
      </label>
      <label
        v-else
        :for="option.toString()"
        tabindex="0"
      ><span>{{ labels[idx] }}</span></label>

    </Row>
  </Row>
</template>

<script>
import Locale from '../cms/Locale.vue';
import Row from '../layout/Row.vue';
export default {
  components: { Row, Locale },
  name: 'ButtonGroup',
  props: {
    value: {
      type: String,
    },
    id: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    labels: {
      type: Array,
    },
    tlabels: {
      type: Array,
    },
    unselectable: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      active: null,
    };
  },
  mounted() {
    const activeOption = this.options.indexOf(this.value);
    if (activeOption != -1) this.active = this.options[activeOption];
  },
  methods: {
    change: function (event) {
      let value = event.target.id;
      if (this.unselectable && event.target.id === this.value) {
        value = null;
      }

      this.$emit('input', value);
    },
  },
  computed: {
    useTlabels() {
      return this.tlabels && this.tlabels.length > 0;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.radio-button-group {
  align-items: stretch;
}

.select {
  height: 37px;
}

label {
  margin: 0;
  font-size: 1rem;
  text-align: center;
}

input {
  display: none;
}

input:checked+label {
  @include buttonColor($white, $primary-color);
}

label {
  @include input;
  background-color: white;
  font-weight: normal;
  font-size: 1em;

  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-button {
  align-items: stretch;
  margin-right: 0 !important;

  &:first-of-type {
    label {
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
  }

  &:last-of-type {
    label {
      border-left-width: 0;
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
    }
  }
}
</style>
