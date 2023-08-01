<template>
  <div class="person-list">
    <span v-if="value == null || (Array.isArray(value) && value.length == 0)">{{
      missingText
    }}</span>
    <ul v-else-if="Array.isArray(value)">
      <li
        v-for="(item, index) of value"
        :key="`person-${index}-${item.id}`"
      >
        {{ cascadeName(item) }}
      </li>
    </ul>
    <ul v-else>
      <li>{{ cascadeName(value) }}</li>
    </ul>
  </div>
</template>

<script>
import StringUtils from '../../utils/StringUtils';
export default {
  props: {
    value: [Array, Object, null],
    // A list of properties to use as the name of the person
    // e.g. if the person has no name, the next property will be used
    targetProps: {
      type: Array,
      default: () => ['name'],
    }
  },
  methods: {
    cascadeName(person) {
      let name = null
      let i = 0
      while (name == null && i < this.targetProps.length) {
        
        if (person[this.targetProps[i]] != null) {
          name = person[this.targetProps[i]]
        }
        i++
      }
      return name
    }
  },
  computed: {
    missingText() {
      return StringUtils.missingText;
    },
  },
};
</script>
