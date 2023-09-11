<template>
  <div class="person-form">
    <PropertyFormWrapper
      property="person"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
      :overwriteRoute="{ name: 'PersonOverview' }"
    >
      <input
        id="person-id"
        v-model="person.id"
        type="hidden"
      />

      <label for="person-name">Name</label>
      <input
        type="text"
        id="person-name"
        v-model="person.name"
        :placeholder="$tc('attribute.name')"
        autofocus
        required
      />

      <label for="person-short-name">Kurzname</label>
      <input
        id="person-short-name"
        type="text"
        v-model="person.shortName"
        :placeholder="$tc('attribute.shortName')"
      />

      <label for="person-role">Rolle</label>
      <DataSelectField
        id="person-role"
        v-model="person.role"
        table="person_role"
        attribute="name"
        queryCommand="searchRole"
      />

      <label for="person-dynasty">Dynastie</label>
      <DataSelectField
        id="person-dynasty"
        v-model="person.dynasty"
        table="dynasty"
        attribute="name"
      />

      <label for="person-color">Farbe</label>
      <color-input
        id="person-color"
        v-model="person.color"
      />
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import DataSelectField from '@/components/forms/DataSelectField.vue';
import LabeledInputContainer from '@/components/LabeledInputContainer.vue';
import ColorInput from '@/components/forms/ColorInput.vue';

import PropertyFormMixinFunc from '../../mixins/property-form-mixin-func';

export default {
  name: 'PersonForm',
  components: {
    PropertyFormWrapper,
    DataSelectField,
    LabeledInputContainer,
    ColorInput,
  },
  mixins: [
    PropertyFormMixinFunc({ variable: "person", property: "person" })
  ],
  data: function () {
    return {
      person: {
        id: -1,
        name: '',
        shortName: '',
        role: { id: null, name: '' },
        dynasty: { id: null, name: '' },
        color: '#000000',
      },
    };
  },
  methods: {
    getProperty: async function (id) {
      const result = await Query.raw(`
      query ($id : ID!){
        getPerson(id: $id){
          id
          name
          shortName
          role {
            id
            name
          }
          dynasty {
            id
            name
          }
          color
        }
      }`, { id })

      let person = result.data.data.getPerson;
      if (person.color === null) person.color = '#ffffff';
      if (person.role == null) person.role = ' ';
      return person
    },
    updateProperty: async function (id) {
      let query;
      let queryName;

      let variables = {
        name: this.person.name,
        shortName: this.person.shortName,
        role: this.person.role.id,
        dynasty: this.person.dynasty.id,
        color: this.person.color,
      };

      if (this.person.id && this.person.id > 0) {
        variables.id = this.person.id;
        queryName = "updatePerson"
        query = `mutation($id:ID!, $name: String,$shortName: String, $role:ID, $dynasty:ID, $color:String)
{
      ${queryName} (
        id: $id,
        data: {
          name: $name,
          shortName: $shortName,
          role: $role,
          dynasty: $dynasty,
          color: $color
        }
      )
  }`;
      } else {
        queryName = "addPerson"
        query = `mutation($name: String,$shortName: String, $role:ID, $dynasty:ID, $color:String)
{
      ${queryName} (
        data: {
          name: $name,
          shortName: $shortName,
          role: $role,
          dynasty: $dynasty,
          color: $color
        }
      )
  }`;
      }

      const result = await Query.raw(query, variables)
      this.person = result.data.data[queryName]


    }
  },
};
</script>
