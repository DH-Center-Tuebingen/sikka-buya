<template>
  <div class="titled-person-select">
    <div class="input-group">
      <DataSelectField
        table="Person"
        attribute="name"
        class="name"
        :placeholder="$tc('attribute.name')"
        :value="person"
        :query-command="queryCommand"
        @input="personChanged"
      />
      <List
        :title="$tc('property.title')"
        :length="titlesLength"
        class="titled-person-title-list"
        @add="addTitle"
      >
        <ListItem
          v-for="(title, title_index) in titles"
          :key="`title-${title_index}`"
          class="list-item"
          :object="title"
          @remove="removeTitle(title_index)"
        >
          <DataSelectField
            table="Title"
            attribute="name"
            class="title"
            :value="title"
            :error="title.error"
            @input="titleChanged($event, title_index)"
          />
        </ListItem>
      </List>

      <List
        :title="$tc('property.honorific')"
        :length="honorificsLength"
        class="titled-person-honorific-list"
        @add="addHonorific"
      >
        <ListItem
          v-for="(honorific, honorific_index) in honorifics"
          :key="`honorific-${honorific_index}`"
          class="list-item"
          :object="honorific"
          @remove="removeHonorific(honorific_index)"
        >
          <DataSelectField
            table="honorific"
            attribute="name"
            class="honorific"
            :value="honorific"
            @input="honorificChanged($event, honorific_index)"
          />
        </ListItem>
      </List>
    </div>
  </div>
</template>

<script>
import DataSelectField from './DataSelectField.vue';
import List from './FormList.vue';
import ListItem from './FormListItem.vue';

export default {
  name: 'TitledPersonSelect',
  components: {
    DataSelectField,
    List,
    ListItem,
  },
  props: {
    queryCommand: {
      type: String,
      default: null,
    },
    value: {
      type: Object,
      required: true,
      validator: function (prop) {
        return prop.titles != undefined && prop.honorifics != undefined;
      },
    },
  },
  data: function () {
    return {
      listKey: 0,
    };
  },
  computed: {
    person: function () {
      return this.value
        ? { id: this.value.id, name: this.value.name }
        : { id: null, name: '' };
    },
    titles: function () {
      return this.value && this.value.titles ? this.value.titles : [];
    },
    honorifics: function () {
      return this.value && this.value.honorifics ? this.value.honorifics : [];
    },
    titlesLength: function () {
      return this.titles.length;
    },
    honorificsLength: function () {
      return this.honorifics.length;
    },
  },
  created: function () {
    this.titles.forEach((element) => {
      element.key = this.buildKey('title');
    });
  },
  methods: {
    buildKey: function (name) {
      const key = `${this.$vnode.key}_${name}_${this.listKey++}`;
      return key;
    },
    personChanged: function (person) {
      this.changed({ person });
    },
    addTitle: function () {
      const titles = this.titles;
      titles.push({ key: this.buildKey('title'), id: null, name: '' });
      this.changed({ titles });
    },
    removeTitle: function (title_index) {
      const titles = this.titles;
      titles.splice(title_index, 1);
      this.changed({ titles });
    },
    addHonorific: function () {
      const honorifics = this.honorifics;
      honorifics.push({ key: this.buildKey('honorific'), id: null, name: '' });
      this.changed({ honorifics });
    },
    removeHonorific(honorific_index) {
      const honorifics = this.honorifics;
      honorifics.splice(honorific_index, 1);
      this.changed({ honorifics });
    },
    honorificChanged: function (honorific, index) {
      const honorifics = this.honorifics;
      honorifics.splice(index, 1, honorific);
      this.changed({ honorifics });
    },
    titleChanged: function (title, index) {
      const titles = this.titles;
      titles.splice(index, 1, title);
      this.changed({ titles });
    },
    changed: function ({
      key = this.value.key,
      person = this.person,
      titles = this.titles,
      honorifics = this.honorifics,
    } = {}) {
      let { name, id } = person;
      this.$emit('input', {
        key,
        name,
        id,
        titles,
        honorifics,
      });
    },
  },
};
</script>

<style lang="scss">
// .titled-person-select .title-row {
//   // margin-left: 10px;
// }

.titled-person-select .title {
  font-size: 13.33px;
}
</style>

<style lang="scss" scoped>
.icon {
  background-color: $gray;
  // padding: $padding;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $white;
  margin-right: $padding;
}

.titled-person-select {
  // padding: 5px;
  // display: flex;
  // border: 1px solid whitesmoke;
  // border-radius: 10px;
  // overflow: hidden;
  // padding: 5px;
  background-color: whitesmoke;
}

.input-group {
  // padding: 5px;
  // display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  flex: 1;
  grid-gap: $padding;

  > * {
    margin-bottom: $padding;
  }
}
.name {
  grid-row: 1;
  grid-column: span 2;
}

.title,
.honorific {
  flex: 1;
}
</style>
