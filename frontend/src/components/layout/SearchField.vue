<template>
  <div
    class="search"
    :class="{ active, 'input-search': isInputSearch }"
  >
    <input
      ref="searchField"
      type="search"
      :placeholder="$t('message.input_to_filter')"
      :value="value"
      @input="input"
    >
    <div
      v-if="isInputSearch"
      class="search-indicator"
    >
      <loading-spinner
        v-if="pending"
        class="spinner"
        :size="LoadingSpinnerSize.Small"
      />
      <Magnify
        v-else
        :size="iconSize"
      />
    </div>
    <async-button
      v-else
      :pending="pending"
      @click="buttonSearch"
    >
      <Magnify :size="iconSize" />
    </async-button>
  </div>
</template>

<script>
import Magnify from 'vue-material-design-icons/Magnify';
import LoadingSpinner from '../misc/LoadingSpinner.vue';
import AsyncButton from './buttons/AsyncButton.vue';

export default {
  components: {
    Magnify,
    LoadingSpinner,
    AsyncButton,
  },
  props: {
    value: { type: String, required: true },
    asyncSearch: {
      // required: true,
      type: Function,
    },
    mode: {
      type: String,
      default: 'input',
      validator(value) {
        return ['button', 'input'].indexOf(value) != -1;
      },
    },
  },
  data: function () {
    return {
      timeout: null,
      delay: 750,
      pending: false,
      pendingI: 0,
      i: 0,
      iconSize: 16
    };
  },

  computed: {
    active: function () {
      return this.value && this.value != '';
    },
    isInputSearch: function () {
      return this.mode == 'input';
    },
  },
  methods: {
    input(event) {
      let value = event.target.value;
      this.$emit('input', value);

      if (this.isInputSearch && this.asyncSearch) {
        this.i++;

        this.pending = true;
        this.pendingI = this.i;

        if (this.timeout) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }

        this.search(value).finally(() => {
          // Only change it back, when no input has occured in the meantime!
          if (this.i == this.pendingI) {
            this.pending = false;
          }
        });

        // We use a local variable, that we dont override a new
        // search, that may happen before the callback is triggered.
        this.timeout = setTimeout(() => { }, this.delay);
      }
    },
    async buttonSearch() {
      await this.search(this.value);
      this.pending = false;
    },
    async search(value) {
      return this.asyncSearch(value);
    },
    keyDown(event) {
      if (event.target == this.$refs.searchField) {
        if (event.key == 'Enter') {
          this.search(this.value);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.search {
  display: flex;
  position: relative;
  border-radius: $border-radius;

  .material-design-icon {
    color: $gray;
  }

  &.active {
    input {
      border-color: $primary-color;
    }

    .material-design-icon {
      color: $primary-color;
    }
  }

  &.input-search input {
    padding-left: 30px;
  }

  >input {
    box-sizing: border-box;
    flex: 1;
    transition: all 0.3s;
    border-radius: $border-radius;
  }

  .spinner {
    position: absolute;
    top: 4px;
    left: $padding - 3;

    &::before,
    &::after {
      background-color: $primary-color;
    }
  }

  .search-indicator {
    position: absolute;
    left: $padding;
    height: 100%;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: all 0.3s;
  }
}
</style>
