<template>
  <div class="person-form">
    <PropertyFormWrapper
      @submit="submit"
      property="person"
      :loading="loading"
      :title="$tc('property.person')"
      :error="error"
      :disabled="disabled"
      overwriteRoute="PersonOverview"
    >
      <input id="person-id" v-model="person.id" type="hidden" />

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
      <color-input id="person-color" v-model="person.color" />
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import DataSelectField from '@/components/forms/DataSelectField.vue';
import LabeledInputContainer from '@/components/LabeledInputContainer.vue';
import ColorInput from '@/components/forms/ColorInput.vue';
export default {
  components: {
    PropertyFormWrapper,
    DataSelectField,
    LabeledInputContainer,
    ColorInput,
  },
  name: 'PersonForm',
  mounted: function () {
    let id = +this.$route.params.id;

    if (!isNaN(id)) {
      Query.raw(
        `
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
      }
      
      `,
        { id }
      )
        .then((result) => {
          this.person = result.data.data.getPerson;
          if (this.person.color === null) this.person.color = '#ffffff';
          if (this.person.role == null) this.person.role = ' ';
          this.disabled = false;
        })
        .catch((err) => {
          this.$data.error = this.$t('error.loading_element');
          console.log(err);
        })
        .finally(() => {
          this.$data.loading = false;
        });
    } else {
      this.disabled = false;
      this.$data.loading = false;
    }
  },
  methods: {
    submit: function () {
      let query;

      let variables = {
        name: this.person.name,
        shortName: this.person.shortName,
        role: this.person.role.id,
        dynasty: this.person.dynasty.id,
        color: this.person.color,
      };

      if (this.person.id && this.person.id > 0) {
        variables.id = this.person.id;
        query = `mutation($id:ID!, $name: String,$shortName: String, $role:ID, $dynasty:ID, $color:String)
      {
            updatePerson (
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
        query = `mutation($name: String,$shortName: String, $role:ID, $dynasty:ID, $color:String)
      {
            addPerson (
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

      Query.raw(query, variables)
        .then((result) => {
          this.$router.push({ name: 'PersonOverview' });
        })
        .catch((err) => {
          this.error = this.$t('error.could_not_update_element');
          console.error(err);
        });
    },
    cancel: function () {
      this.$router.push({ name: 'PersonOverview' });
    },
  },
  data: function () {
    return {
      error: '',
      loading: true,
      disabled: true,
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
};
</script>
