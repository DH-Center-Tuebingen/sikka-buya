<template>
  <div class="list">
    <LoadingSpinner
      class="loading-spinner"
      v-if="loading"
    />

    <header v-if="properties">
      <div
        v-for="(label, idx) of [...properties]"
        :key="`label-of-${label}-${idx}`"
      >
        {{ label }}
      </div>
    </header>
    <ErrorBox
      v-if="error"
      type="error"
    >
      <Locale :path="error" />
    </ErrorBox>

    <ErrorBox
      v-if="!items || (items && items.length == 0 && !loading && error == '')"
      type="info"
    >
      <Locale path="warning.list_is_empty" />
    </ErrorBox>

    <ErrorBox
      v-else-if="filteredItems && filteredItems.length == 0 && !loading && error == ''"
      type="info"
    >
      <Locale path="warning.filtered_list_is_empty" />
    </ErrorBox>


    <slot></slot>
  </div>
</template>

<script>
import Locale from "@/components/cms/Locale"
import ListItem from './ListItem.vue';
import LoadingSpinner from '../misc/LoadingSpinner.vue';
import ErrorBox from "../page/system/ErrorBox.vue"

export default {
  components: {
    ErrorBox,
    ListItem,
    LoadingSpinner,
    Locale,
  },
  props: {
    properties: {
      type: Array,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    items: {
      id: String,
      name: String,
      required: true,
    },
    error: {
      type: String,
      default: '',
    },
    filteredItems: {
      type: Array,
      default: null,
    },
    noRemove: Boolean,
  },
  methods: {
    listItemClicked: function (id) {
      this.$emit('select', id);
    },
    listItemRemoved: function (id) {
      this.$emit('remove', id);
    },
  },
};
</script>

<style lang="scss" scoped>
.list {
  margin: $padding 0;
}


.loading-spinner {
  align-self: center;
}

header {
  display: flex;
  align-items: center;
  padding: 0 $padding;
  border-bottom-width: 0;
  background-color: rgb(224, 224, 224);
  color: gray;
  border: 1px solid #cccccc;
  border-bottom: none;
  font-weight: bold;

  >* {
    flex: 1;
  }

  >* {
    text-transform: uppercase;
  }
}

.search {
  display: flex;

  >input {
    flex: 1;
  }
}
</style>
