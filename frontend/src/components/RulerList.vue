<template>
  <div class="ruler-list">
    <multi-select-list v-if="!group">
      <ruler-list-section
        v-if="Array.isArray(selectedUnavailable) && selectedUnavailable.length > 0"
        :items="selectedUnavailable"
        :selectedIds="selectedIds"
        :styler="unavailableSelectedStyler"
        @selection-changed="(item) => this.checkboxSelected(item)"
      />
      <ruler-list-section
        :items="items"
        :selectedIds="selectedIds"
        :styler="availableStyler"
        @selection-changed="(item) => this.checkboxSelected(item)"
      />
      <ruler-list-section
        :items="unavailable"
        :selectedIds="selectedIds"
        :styler="unavailableSelectedStyler"
        @selection-changed="(item) => this.checkboxSelected(item)"
      />
    </multi-select-list>
    <multi-select-list v-else>
      <collapsible
        v-for="group of groups"
        :key="group.key"
        @toggled="(collapsed) => toggleCollapsible(group.key, collapsed)"
        :collapsed="isCollapsed(group.key)"
      ><template v-slot:header>
          <selectable-list-header
            @select-all="selectAllInGroup(group)"
            @unselect-all="removeAllFromGroup(group)"
            :allSelected="allSelected(group)"
            :noneSelected="noneSelected(group)"
            :selected="selectedItemsInGroup(group).length"
            :total="group.items.length"
          >
            {{ group.label }}

            <span
              v-if="$store.state.debug"
              class="debug"
            >({{ group.key }})</span>
          </selectable-list-header>
        </template>
        <ruler-list-section
          :unavailable="selectedUnavailable"
          :items="sorted(group.items)"
          :selectedIds="selectedIds"
          :styler="availableStyler"
          @selection-changed="checkboxSelected"
        />
      </collapsible>
    </multi-select-list>
  </div>
</template>

<script>
import MultiSelectList from './MultiSelectList.vue';
import MultiSelectListItem from './MultiSelectListItem.vue';
import MultiSelectListMixin from './mixins/multi-select-list.js';

import CollapsibleListMixin from './mixins/collapsible-list.js';

import Person from '../utils/Person';
import RulerListSection from './RulerListSection.vue';
import Collapsible from './layout/Collapsible.vue';
import Sort from '../utils/Sorter';
import SelectableListHeader from './list/SelectableListHeader.vue';
export default {
  props: {
    group: { default: false, type: Boolean },
    selectedUnavailable: {
      type: Array,
      validator: (items) => {
        return items.every((item) => item && item.hasOwnProperty('id'));
      },
    },
    unavailable: {
      type: Array,
      validator: (items) => {
        return items.every((item) => item && item.hasOwnProperty('id'));
      },
    },
  },
  mixins: [MultiSelectListMixin, CollapsibleListMixin],
  components: {
    MultiSelectList,
    MultiSelectListItem,
    RulerListSection,
    Collapsible,
    SelectableListHeader,
  },
  methods: {
    sorted(items) {
      items.sort((a, b) => {
        let nameA = Person.getName(a);
        let nameB = Person.getName(b);

        return Sort.stringAlphabetically()(nameA, nameB);
      });
      return items;
    },
    getRulerName(ruler) {
      return Person.getName(ruler);
    },
    availableStyler(item) {
      return { color: item.color };
    },
    unavailableSelectedStyler(item) {
      const baseStyle = this.availableStyler(item);
      baseStyle.opacity = 0.5;
      return baseStyle;
    },
  },
  computed: {
    groups() {
      let groups = Object.values(
        this.items.reduce((prev, curr) => {
          let { id: key, name: label } = curr.dynasty;

          if (prev[key]) {
            prev[key].items.push(curr);
          } else {
            prev[key] = { key, label, items: [curr] };
          }
          return prev;
        }, {})
      ).sort(function (a, b) {
        const toBack = ['?'];
        const toFront = ['Būyide'];

        a = a.label;
        b = b.label;

        if (
          (toFront.indexOf(a) !== -1 && toFront.indexOf(b) === -1) ||
          (toBack.indexOf(a) === -1 && toBack.indexOf(b) !== -1)
        ) {
          return -1;
        } else if (
          (toBack.indexOf(a) !== -1 && toBack.indexOf(b) === -1) ||
          (toFront.indexOf(a) === -1 && toFront.indexOf(b) !== -1)
        ) {
          return 1;
        } else return Sort.stringAlphabetically(a, b);
      });

      groups.forEach((group) =>
        group.items.sort(Sort.stringPropAlphabetically('shortName'))
      );

      return groups;
    },
  },
};
</script>

<style lang="scss">
.ruler-list {
  li {
    border: none;
    border-radius: 0;
    padding-left: 5px;


  }

  .select-list-item .row {
    display: grid;
    grid-template-columns: 14px 30px 1fr;
    gap: .1rem
  }

  .multi-select-list .select-list-item {
    grid-template-columns: auto 30px 1fr;
  }

  span {
    color: $black;
  }

  // .color-indicator {
  //   $size: 1em;
  //   width: math.div($size, 3);
  //   height: $size;
  //   border-radius: $border-radius;
  //   border: 3px solid currentColor;
  //   background-color: currentColor;
  //   margin-right: 5px;
  // }
}
</style>
