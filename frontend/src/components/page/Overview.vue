<template>
  <div :class="`overview ${property}-page`">
    <BackHeader :to="{ name: 'Editor' }" />
    <header>
      <h1>
        <Locale
          :path="`property.${fixedPropertyName}`"
          :count="2"
        />
      </h1>

      <ButtonVue
        id="create-button"
        @click="create"
      >
        <Icon
          :path="icons.add"
          :size="IconSize.Normal"
          type="mdi"
        />
        <locale path="form.create" />
      </ButtonVue>
    </header>

    <SearchField
      v-model="textFilter"
      :async-search="search"
    />
    <List
      :error="listError"
      :loading="loading"
      :items="items"
      :filtered-items="items"
      @remove="remove"
    >
      <ListItem
        v-for="item of items"
        :id="item.id"
        :key="item.id"
        :disable="deleteButtonActive"
      >
<slot
          name="list-item-before"
          :item="item"
        />
        <ListItemCell :to="getEditRoute(item)">
{{ item.name }}
</ListItemCell>
        <ButtonVue
          v-for="tool in tools"
          :key="'tool-' + tool"
          @click="() => $emit('tool', tool, { id: item.id })"
        >
{{ $t('editor.' + tool) }}
</ButtonVue>
        <DynamicDeleteButton
          @delete="deleteButtonRemove(item.id)"
          @open="deleteButtonEnable()"
          @cancel="deleteButtonDisable()"
        />
      </ListItem>
    </List>
  </div>
</template>

<script>

import List from '../layout/List.vue';
import Query from '../../database/query.js';
import BackHeader from '../layout/BackHeader.vue';
import SearchField from '../layout/SearchField.vue';

import ListItemCell from '../layout/list/ListItemCell.vue';
import ListItem from '../layout/ListItem.vue';
import { camelCase, snakeCase } from 'change-case';

import DeleteButtonMixin from '../mixins/deletebutton';
import ButtonVue from '../layout/buttons/Button.vue';
import Locale from '../cms/Locale.vue';

import IconMixin from "@/components/mixins/icon-mixin"
import { mdiPlus } from '@mdi/js';

export default {
  name: 'OverviewPage',
  components: {
    List,
    BackHeader,
    SearchField,
    ListItem,
    ListItemCell,
    ButtonVue,
    Locale
  },
  mixins: [DeleteButtonMixin, IconMixin({ add: mdiPlus })],
  props: {
    query: String,
    createPage: String,
    tools: Array,
    parameters: { type: Array, default: () => [] },
    propertyName: String,
    property: {
      type: String,
      required: true,
    },
  },
  data: function () {
    return {
      loading: true,
      items: [],
      textFilter: '',
      searchId: 0,
      listError: '',
    };
  },
  computed: {
    fixedPropertyName: function () {
      return this.propertyName ? this.propertyName : this.property;
    },
    queryName: function () {
      return this.query ? this.query : camelCase(this.property);
    },

  },
  created: function () {
    this.list();
  },
  methods: {
    getEditRoute: function (item) {
      return {
        path: `/editor/${snakeCase(this.property)}/${item.id}`
      };
    },
    async list() {
      new Query(this.queryName)
        .list(['id', 'name', ...this.parameters])
        .then((obj) => {
          this.$data.items = obj.data.data[this.queryName];
        })
        .catch((e) => {
          this.listError = this.$t('error.loading_list');
          console.error(e)
        })
        .finally(() => {
          this.$data.loading = false;
        }, true);
    },
    search() {
      let queryCommand = `search${this.$utils.capitalize(this.queryName)}`;
      Query.raw(
        `{
            ${queryCommand}
            (text: "${this.textFilter}"){
              ${['id', 'name', ...this.parameters].join(',')}
            }
          }`
      )
        .then((obj) => {
          this.$data.items = obj.data.data[queryCommand];
        })
        .catch((e) => {
          console.error('Could not search', e);
          this.error = this.$t('error.loading_list');
        })
        .finally(() => {
          this.$data.loading = false;
        });
    },
    create() {
      if (this.createPage) {
        this.$router.push({ name: this.createPage });
      } else {
        this.$router.push({
          path: `${snakeCase(this.property)}/create`,
        });
      }
    },
    remove(id) {
      new Query(this.queryName)
        .delete(id)
        .then((answer) => {
          const idx = this.$data.items.findIndex((item) => item.id == id);
          if (idx != -1) this.$data.items.splice(idx, 1);
        })
        .catch((err) => {
          this.displayError(this.$t('error.delete_list_item_prevented'));
          console.error(err);
        });
    },
    displayError(err) {
      this.$store.commit('printError', err);
    },
  },
};
</script>

<style lang="scss">
.overview {
  .list-item a {
    padding: 0.1rem 0.5rem;
  }
}
</style>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: column;
  margin: $padding 0;
  // padding: $padding;
  overflow: hidden;
  background-color: whitesmoke;
  border-radius: 3px;

  box-shadow: inset 1px 2px 5px rgba(0, 0, 0, 0.1);
}

.list-item {
  align-items: center;
  display: flex;

  transition: background-color 0.15s;

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


section>* {
  margin-bottom: $padding;
}

h1 {
  margin-bottom: 0;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem
}
</style>
