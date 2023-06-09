<template>
  <div class="mint-list">
    <multi-select-list>
      <Collapsible
        class="group"
        v-for="(group, idx) of groupedItems"
        @toggled="(collapsed) => toggleCollapsible(group.id, collapsed)"
        :collapsed="isCollapsed(group.id)"
        :key="`mint-list-group-${idx}`"
      >
        <template #header>
          <selectable-list-header
            @select-all="selectAllInGroup(group)"
            @unselect-all="removeAllFromGroup(group)"
            :allSelected="allSelected(group)"
            :noneSelected="noneSelected(group)"
            :selected="selectedItemsInGroup(group).length"
            :total="group.items.length"
          >
            {{ group.name }}
            <span v-if="$store.state.debug" class="debug"
              >({{ group.id }})</span
            >
          </selectable-list-header>
        </template>
        <ul>
          <MultiSelectListItem
            v-for="item of group.items"
            :key="'ruler-' + item.id"
            :selected="isSelected(item)"
            @checkbox-selected="checkboxSelected(item)"
            @click.native="checkboxSelected(item)"
            :class="{ available: item.available }"
            :style="{ color: item.color, borderColor: item.color }"
          >
            <span
              >{{ item.name }}

              <span v-if="$store.state.debug" class="debug"
                >({{ item.id }})</span
              >
            </span>
          </MultiSelectListItem>
        </ul>
      </Collapsible>
    </multi-select-list>
  </div>
</template>

<script>
import MultiSelectList from './MultiSelectList.vue';
import MultiSelectListItem from './MultiSelectListItem.vue';
import MultiSelectListMixin from './mixins/multi-select-list.js';

import CollapsibleListMixin from './mixins/collapsible-list.js';

import Collapsible from './layout/Collapsible.vue';
import Sort from '../utils/Sorter';
import Checkbox from './forms/Checkbox.vue';

import ListSelectionTools from './interactive/ListSelectionTools.vue';
import SelectableListHeader from './list/SelectableListHeader.vue';

export default {
  components: {
    MultiSelectList,
    MultiSelectListItem,
    Collapsible,
    Checkbox,

    ListSelectionTools,
    SelectableListHeader,
  },
  mixins: [MultiSelectListMixin, CollapsibleListMixin],
  methods: {
    toggleAllProvince(group) {
      if (this.allSelected(group)) {
        this.selectAllInGroup(group);
      } else {
        this.removeAllFromGroup(group);
      }
    },
  },

  computed: {
    groupedItems() {
      let groups = {};

      this.items.forEach((mint) => {
        const province = mint.province?.name ? mint.province.name : '_';
        if (!groups[province]) {
          const id = mint.province?.id;
          groups[province] = {
            id,
            name: province,
            items: [],
          };
        }
        groups[province].items.push(mint);
      });

      const groupArray = Object.values(groups);
      groupArray.sort(Sort.stringPropAlphabetically('name'));

      return groupArray;
    },
  },
};
</script>

<style lang="scss" scoped>
h4 {
  color: #333;
}

.select-list-item {
  opacity: 0.5;
}
.available {
  opacity: 1;
}
</style>