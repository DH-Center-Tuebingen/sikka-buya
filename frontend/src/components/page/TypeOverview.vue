<template>
  <div :class="`overview type-overview`">
    <BackHeader :to="{ name: 'Editor' }" />
    <header>
      <h1>
        <Locale
          path="property.type"
          :count="2"
        />
      </h1>
      <div
        v-if="isEditor"
        id="create-button"
        class="button"
        @click="create"
        tabindex="1"
        autofocus
        @keydown.enter="create"
      >
        <PlusCircleOutline />
        <span>
          <locale path="form.create" />
        </span>
      </div>
    </header>
    <SearchField
      ref="search"
      v-model="filter.text"
      :asyncSearch="textFilterChanged"
    />
    <ListFilterContainer
      :filtered="isListFiltered"
      @clearFilters="clearFilters"
    >
      <div
        class="toggle-group"
        v-if="isEditor"
      >
        <labeled-property
          v-for="name of evalFilter"
          :key="'toggle-filter-' + name"
          :label="$tc('property.' + name)"
        >
          <three-way-toggle
            :value="filter[name]"
            @input="filterChanged(name, $event)"
          />
        </labeled-property>

        <labeled-property
          v-for="name of adminFilter"
          :key="'toggle-filter-' + name"
          :label="$tc('property.' + name)"
        >
          <three-way-toggle
            :value="filter[name]"
            @input="filterChanged(name, $event)"
          />
        </labeled-property>
      </div>
      <div class="toggle-group">
        <labeled-property
          v-for="name of toggleFilter"
          :key="'toggle-filter-' + name"
          :label="$tc('property.' + name)"
        >
          <three-way-toggle
            :value="filter[name]"
            @input="filterChanged(name, $event)"
          />
        </labeled-property>
      </div>
      <div class="data-select-filters">
        <labeled-property
          v-for="name of objectFilter"
          :key="'obj-filter-' + name"
          :label="$tc('property.' + name)"
        >
          <DataSelectField
            v-if="name == 'caliph'"
            :value="filter[name]"
            attribute="name"
            table="person"
            queryCommand="searchPersonsWithRole"
            :queryBody="['id', { role: ['id', 'name'] }, 'name']"
            :additionalParameters="{ include: ['caliph'] }"
            @input="filterChanged(name, $event)"
          />
          <div v-else-if="name == 'coin_mark'">
            <data-select-field
              :value="filter[name]"
              attribute="name"
              table="coinMark"
              @input="filterChanged(name, $event)"
            />
          </div>
          <DataSelectField
            v-else
            :value="filter[name]"
            attribute="name"
            :table="name"
            @input="filterChanged(name, $event)"
          />
        </labeled-property>
      </div>
    </ListFilterContainer>

    <pagination
      :pageInfo="pageInfo"
      @input="updatePagination"
    >
      <List
        :error="error"
        :items="list"
        :loading="loading"
      >
        <ListItem
          v-for="item of items"
          v-bind:key="item.key"
          :id="`list-item-type-${item.id}`"
          :class="item.completed ? 'completed' : 'incomplete'"
        >
          <ListItemCell :to="{
            name: path,
            params: { id: item.id },
          }">
            {{ item.projectId }}
          </ListItemCell>
          <CompletedToggle
            class="done-button"
            icon="check-icon"
            :readonly="!$store.getters.userHasPermission('super')"
            :value="item.completed"
            @input="changeCompleteState($event, item)"
          />
          <CompletedToggle
            class="reviewed-button"
            icon="check-emphasis-icon"
            :readonly="!$store.getters.userHasPermission('super')"
            :value="item.reviewed"
            @input="changeReviewedState($event, item)"
          />
          <DynamicDeleteButton @delete="remove(item.id)" />
        </ListItem>
      </List>
    </pagination>
  </div>
</template>

<script>
import PlusCircleOutline from 'vue-material-design-icons/PlusCircleOutline';

import Query from '../../database/query.js';
import BackHeader from '../layout/BackHeader.vue';
import SearchField from '../layout/SearchField.vue';
import CompletedToggle from '../layout/buttons/CompletedToggle.vue';
import DynamicDeleteButton from '../layout/DynamicDeleteButton.vue';

import List from '../layout/List.vue';
import ListItem from '../layout/ListItem.vue';
import ListItemIdField from '../layout/list/ListItemIdField.vue';
import ListItemCell from '../layout/list/ListItemCell.vue';

import ListFilterContainer from '../layout/list/ListFilterContainer.vue';
import RadioButtonGroup from '../forms/RadioButtonGroup.vue';
import AxiosHelper from '@/utils/AxiosHelper.js';
import ReviewedToggle from '../layout/buttons/ReviewedToggle.vue';
import Button from '../layout/buttons/Button.vue';
import Row from '../layout/Row.vue';
import PaginationControl from '../list/PaginationControl.vue';
import Checkbox from '../forms/Checkbox.vue';
import DataSelectField from '../forms/DataSelectField.vue';
import LabeledProperty from '../display/LabeledProperty.vue';
import ThreeWayToggle from '../forms/ThreeWayToggle.vue';
import { camelCase } from 'change-case';
import Pagination from '../list/Pagination.vue';
import Locale from '../cms/Locale.vue';

const defaultFilters = {
  text: '',
  completed: null,
  reviewed: null,
  exclude_from_type_catalogue: null,
  exclude_from_map_app: null,
  mint_uncertain: null,
  year_uncertain: null,
  cursive_script: null,
  donativ: null,
  nominal: { id: null },
  material: { id: null },
  caliph: { id: null },
  mint: { id: null },
  coin_mark: { id: null },
};

export default {
  name: 'TypeOverviewPage',
  components: {
    PlusCircleOutline,
    List,
    BackHeader,
    SearchField,
    ListItem,
    CompletedToggle,
    DynamicDeleteButton,
    ListItemIdField,
    ListItemCell,
    ListFilterContainer,
    RadioButtonGroup,
    ReviewedToggle,
    Button,
    Row,
    PaginationControl,
    Checkbox,
    DataSelectField,
    LabeledProperty,
    ThreeWayToggle,
    Pagination,
    Locale,
  },
  mounted: function () {
    let filters = this.isEditor
      ? localStorage.getItem('type-list-filter')
      : null;
    if (filters) {
      try {
        let filterObj = JSON.parse(filters);
        Object.assign(this.$data.filter, filterObj);
      } catch (e) {
        console.error('Could not parse filters.');
      }
    }

    if (this.isEditor)
      this.pageInfo.count =
        parseInt(localStorage.getItem('pagination-count')) || 30;
    this.updateTypeList();
    this.$refs.search.$el.querySelector('input').focus();
  },
  computed: {
    isEditor() {
      return this.adminView;
    },
    path() {
      return this.isEditor ? 'EditType' : 'Catalog Entry';
    },
    allToggleFilters() {
      return [...this.evalFilter, ...this.toggleFilter, ...this.adminFilter];
    },
    isListFiltered: function () {
      let filtered = false;
      for (let [key, val] of Object.entries(this.filter)) {
        if (defaultFilters[key] === undefined) {
          console.warn('Filter is not implemented in defaults!', key);
          continue;
        }

        if (val != null && typeof val === 'object') {
          if (val.id && val.id >= 0) {
            filtered = true;
            break;
          }
        } else {
          if (defaultFilters[key] != val) {
            filtered = true;
            break;
          }
        }
      }

      return filtered;
    },
    editorFilter() {
      return this.isEditor ? '' : 'excludeFromTypeCatalogue: false';
    },
    list: function () {
      return this.$data.items;
    },
  },
  props: {
    adminView: {
      default: false,
      type: Boolean,
    },
  },
  data: function () {
    return {
      loading: false,
      items: [],
      countList: [10, 25, 50],
      pageInfo: {
        count: 20,
        page: 0,
        last: 0,
        total: 0,
      },
      error: '',
      filter: {
        text: '',
        completed: null,
        reviewed: null,
        exclude_from_type_catalogue: null,
        exclude_from_map_app: null,
        mint_uncertain: null,
        year_uncertain: null,
        cursive_script: null,
        donativ: null,
        nominal: { id: null },
        material: { id: null },
        caliph: { id: null },
        mint: { id: null },
        coin_mark: { id: null },
      },
      objectFilter: ['mint', 'material', 'nominal', 'caliph', 'coin_mark'],
      adminFilter: ['exclude_from_type_catalogue', 'exclude_from_map_app'],
      toggleFilter: [
        'mint_uncertain',
        'year_uncertain',
        'cursive_script',
        'donativ',
      ],
      evalFilter: ['completed', 'reviewed'],
    };
  },
  methods: {
    clearFilters() {
      this.filter.text = '';

      this.allToggleFilters.forEach((name) => {
        this.filter[name] = null;
      });

      this.objectFilter.forEach((name) => {
        this.filter[name] = { id: null };
      });

      this.updateTypeList();
      this.filtersChanged();
    },
    getToggleFiltersFields() {
      let activeFilter = [];
      this.allToggleFilters.forEach((name) => {
        if (this.filter[name] != null) {
          activeFilter.push(`${camelCase(name)}: ${this.filter[name]}`);
        }
      });
      return activeFilter.join('\n');
    },
    getObjectFilters() {
      let activeFilter = [];
      this.objectFilter.forEach((name) => {
        if (this.filter[name] != null && this.filter[name]?.id != null) {
          activeFilter.push(`${camelCase(name)}: ${this.filter[name].id}`);
        }
      });
      return activeFilter.join('\n');
    },
    updateTypeList: async function () {
      if (this.loading) return;
      this.loading = true;
      Query.raw(
        `
    {
      modGetTypes(
          pagination: {
          count:${this.pageInfo.count}, page:${this.pageInfo.page}
          },
          filters: {
            projectId: "${this.filter.text}"
            ${this.editorFilter}
            ${this.getObjectFilters()}
            ${this.getToggleFiltersFields()}

            
          }
        ) {
        types {
            id
            projectId
            completed
            reviewed
        }
        pageInfo {
          page
          count
          total
          last
        }
      }
    }`
      )
        .then((result) => {
          if (AxiosHelper.ok(result)) {
            this.loading = false;
            let data = result.data.data.modGetTypes;

            if (data) {
              const lastPage = Math.floor(
                data.pageInfo.total / (data.pageInfo.count || 1)
              );

              if (this.pageInfo.page > lastPage) {
                let pageInfo = data.pageInfo;
                pageInfo.page = lastPage;
                this.pageInfo = pageInfo;
              } else {
                this.$data.items = data.types;
                if (
                  !(
                    this.pageInfo.page === data.pageInfo.page &&
                    this.pageInfo.total === data.pageInfo.total &&
                    this.pageInfo.current === data.pageInfo.current &&
                    this.pageInfo.last === data.pageInfo.last
                  )
                )
                  this.pageInfo = data.pageInfo;
                this.error = '';
              }
            } else {
              this.error = 'Keine Daten wurden zurückgegeben.';
            }
          } else {
            this.error = AxiosHelper.getErrors(result).join('\n');
          }
        })
        .catch((e) => {
          console.error(e);
          this.error = this.$t('error.loading_list');
        })
        .finally(() => {
          this.$data.loading = false;
          // this.loading = false;
        });
    },
    create() {
      this.$router.push({
        name: `TypeCreationPage`,
      });
    },
    changeReviewedState(state, item) {
      Query.raw(
        `
        mutation{
          setTypeReviewed(id: ${item.id}, reviewed: ${state})
        }
      `
      )
        .then((result) => {
          if (result.status >= 200 && result.status <= 200) {
            item.reviewed = result.data.data.setTypeReviewed;
          }
        })
        .catch((err) => {
          this.error = err;
        });
    },
    changeCompleteState(state, item) {
      Query.raw(
        `
        mutation{
          setTypeComplete(id: ${item.id}, completed: ${state})
        }
      `
      )
        .then((result) => {
          if (result.status >= 200 && result.status <= 200) {
            item.completed = result.data.data.setTypeComplete;
          }
        })
        .catch((err) => {
          this.error = err;
        });
    },
    remove(id) {
      Query.raw(
        `mutation{
  deleteCoinType(id: ${id})
}`
      )
        .then(() => {
          const idx = this.$data.items.findIndex((item) => item.id == id);
          if (idx != -1) this.$data.items.splice(idx, 1);
        })
        .catch((answer) => {
          answer.forEach((err) => {
            this.$store.commit('printError', this.$t(err));
          });
        });
    },
    filterChanged(name, val) {
      this.filter[name] = val;
      this.filtersChanged();
    },
    updatePagination(val) {
      this.pageInfo = val;
      this.updateTypeList();
      if (this.isEditor) {
        try {
          localStorage.setItem('pagination-count', this.pageInfo.count);
        } catch (e) {
          console.warn(e);
        }
      }
    },
    completedChanged(val) {
      this.filter.completed = val;
      this.filtersChanged();
    },
    reviewedChanged(val) {
      this.filter.reviewed = val;
      this.filtersChanged();
    },
    mintChanged(val) {
      this.filter.mint = val;
      this.filtersChanged();
    },
    async textFilterChanged() {
      await this.filtersChanged();
    },
    async filtersChanged() {
      if (this.isEditor) {
        try {
          localStorage.setItem('type-list-filter', JSON.stringify(this.filter));
        } catch (e) {
          console.warn(e);
        }
      }
      await this.updateTypeList();
    },
  },
};
</script>

<style lang="scss">
.type-overview {
  .labeled-property .label {
    margin-bottom: math.div($padding, 2);
  }

  .type-overview .list-item-row {
    height: 44px;
  }

  .toggle-button.active {
    background-color: $bright-blue;
  }
}
</style>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgb(78, 78, 78);

  background-color: whitesmoke;

  box-shadow: inset 1px 2px 5px rgba(0, 0, 0, 0.1);
}

.data-select-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $padding;
}

.list-item {
  align-items: center;
  display: flex;

  transition: background-color 0.15s;

  &.completed {
    background-color: rgb(243, 242, 242);
  }

  > :first-child {
    flex: 1;
  }
}

.edit {
  display: flex;
  height: 100%;
  flex: 1;

  background-color: whitesmoke;
  @include interactive();
  margin-right: $padding;
  padding: $padding $padding;

  &:hover {
    background-color: gray;
  }
}

.button {
  @include interactive();
  display: flex;
  align-items: center;
  padding: $padding;

  border-radius: $border-radius;

  >* {
    margin-right: $padding;
  }
}

.overview>* {
  margin-bottom: $padding;
}

.toggle-group {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  justify-items: center;
  text-align: center;
  align-items: flex-end;
  margin: 40px 0;

  @include media-phone {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#create-button {
  background-color: $primary-color;
  color: $white;
  // position: absolute;
  right: 0;
  top: 0;
}
</style>
