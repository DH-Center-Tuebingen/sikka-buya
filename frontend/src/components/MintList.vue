<template>
  <div class="mint-list">
    <multi-select-list>
      <Collapsible
        v-for="(group, idx) of groupedItems"
        :key="`mint-list-group-${idx}`"
        class="group"
        :collapsed="isCollapsed(group.id)"
        @toggled="(collapsed) => toggleCollapsible(group.id, collapsed)"
      >
        <template #header>
          <selectable-list-header
            :all-selected="allSelected(group)"
            :none-selected="noneSelected(group)"
            :selected="selectedItemsInGroup(group).length"
            :total="group.items.length"
            @select-all="selectAllInGroup(group)"
            @unselect-all="removeAllFromGroup(group)"
          >
            {{ group.name }}
            <span
v-if="$store.state.debug"
class="debug"
>({{ group.id }})</span>
          </selectable-list-header>
        </template>
        <ul>
          <MultiSelectListItem
            v-for="item of group.items"
            :key="'ruler-' + item.id"
            :selected="isSelected(item)"
            :class="{ available: item.available }"
            :style="{ color: item.color, borderColor: item.color }"
            @checkbox-selected="checkboxSelected(item)"
            @click.native="checkboxSelected(item)"
          >
            <span>{{ item.name }}

              <span
v-if="$store.state.debug"
class="debug"
>({{ item.id }})</span>
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
import SelectableListHeader from './list/SelectableListHeader.vue';

export default {
  components: {
    MultiSelectList,
    MultiSelectListItem,
    Collapsible,
    SelectableListHeader,
  },
  mixins: [MultiSelectListMixin, CollapsibleListMixin],

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
  methods: {
    toggleAllProvince(group) {
      if (this.allSelected(group)) {
        this.selectAllInGroup(group);
      } else {
        this.removeAllFromGroup(group);
      }
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