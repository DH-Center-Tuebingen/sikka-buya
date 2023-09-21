<template>
  <div class="mint-form">
    <PropertyFormWrapper
      property="mint"
      @submit="property_form_mixin_submit"
      @cancel="property_form_mixin_cancel"
      :loading="property_form_mixin_loading"
      :title="property_form_mixin_title"
      :error="property_form_mixin_error"
      :disabled="property_form_mixin_disabled"
      :dirty="property_form_mixin_dirty"
    >
      <input
        id="mint-id"
        v-model="mint.id"
        type="hidden"
      />
      <label for="mint-name">Name</label>
      <input
        type="text"
        id="mint-name"
        v-model="mint.name"
        :placeholder="$tc('attribute.name')"
        autofocus
        required
      />

      <labeled-input-container :label="$tc('property.province')">
        <DataSelectField
          table="Province"
          attribute="name"
          v-model="mint.province"
          id="mint-province"
        />
      </labeled-input-container>

      <label for="location">Location</label>
      <location-input
        id="mint-location"
        :only="['point']"
        v-model="mint.location"
        ref="location"
        @update="(location) => $set(mint, 'location', location)"
      />

      <div id="uncertain-row">
        <Checkbox
          id="mint-location-uncertain"
          v-model="mint.uncertain"
          :label="$t('property.uncertain_location') + '(?)'"
        />
      </div>

      <div v-show="mint.uncertain">
        <label for="location">Geschätzte Verortung</label>
        <location-input
          id="mint-uncertain-location-input"
          :interactive="true"
          :only="['polygon']"
          v-model="mint.uncertainArea"
          ref="uncertainLocation"
          @update="(location) => $set(mint, 'uncertainArea', location)"
        />
      </div>

      <labeled-input-container label="Notizen">
        <textarea
          id="mint-notes"
          cols="30"
          rows="10"
          maxlength="1300"
          v-model="note"
        ></textarea>
      </labeled-input-container>
    </PropertyFormWrapper>
  </div>
</template>

<script>
import Query from '../../../database/query.js';
import PropertyFormWrapper from '../PropertyFormWrapper.vue';
import Checkbox from '../../forms/Checkbox';
import LocationInput from '../../forms/LocationInput.vue';
import GraphQLUtils from '../../../utils/GraphQLUtils.js';
import DataSelectField from '../../forms/DataSelectField.vue';
import LabeledInputContainer from '../../LabeledInputContainer.vue';

import propertyFormMixinFunc from '../../mixins/property-form-mixin-func';


export default {
  components: {
    Checkbox,
    PropertyFormWrapper,
    LocationInput,
    DataSelectField,
    LabeledInputContainer,
  },
  name: 'MintForm',
  mixins: [propertyFormMixinFunc({ property: 'mint' })],
  methods: {
    getProperty: async function (id) {
      const result = await Query.raw(
        `    {
                getMint (id:${id})  {
                    id,
                    name,
                    province {
                      id, name
                    }
                    location 
                    uncertain,
                    uncertainArea
                }
                getNote (property: "mint", propertyId:${id})
              }`, { id })

      this.note = result.data.data.getNote;
      return result.data.data.getMint;
    },
    updateProperty: async function () {
      if (this.id)
        await this.update()
      else
        await this.create()
    },
    update: async function () {
      return Query.raw(
        `
        mutation UpdateMint(
          $id: ID!,
          $name: String,
          $location: GeoJSON,
          $uncertain: Boolean,
          $uncertainArea: GeoJSON,
          $province: ID,
          $note: String,
        ){
          updateMint(
            id: $id,
            data: {
              name: $name,
              location: $location,
              uncertain: $uncertain,
              uncertainArea: $uncertainArea,
              province: $province,
            })
            updateNote(text: $note, property: "mint", propertyId: $id)
        }
        `, {
        id: this.id,
        name: this.mint.name,
        location: this.$refs.location.getGeoJSON(),
        uncertain: this.mint.uncertain,
        uncertainArea: this.$refs.uncertainLocation.getGeoJSON(),
        province: this.mint.province?.id,
        note: this.note,
      })

    },
    create: async function () {

      console.log(this.$refs.location.getGeoJSON())
      const result = await Query.raw(
        `
        mutation AddMint(
          $name: String,
          $location: GeoJSON,
          $uncertain: Boolean,
          $uncertainArea: GeoJSON,
          $province: ID,
        ){
          addMint(
            data: {
              name: $name,
              location: $location,
              uncertain: $uncertain,
              uncertainArea: $uncertainArea,
              province: $province,
            })
        }
        `, {
        name: this.mint.name,
        location: this.$refs.location.getGeoJSON(),
        uncertain: this.mint.uncertain,
        uncertainArea: this.$refs.uncertainLocation.getGeoJSON(),
        province: this.mint.province?.id,
        note: this.note,
      })

      const id = result.data.data.addMint;
      await Query.raw(`mutation UpdateNote($note: String, $id: ID!) {
        updateNote(text: $note, property: "mint", propertyId: $id)
      }`, {
        id,
        note: this.note,
      })

      return id;
    },
  },
  data: function () {
    return {
      note: '',
      mint: {
        id: -1,
        name: '',
        uncertain: false,
        province: {
          id: null,
          name: '',
        },
        location: {
          type: 'point',
          coordinates: null,
        },
        uncertainArea: {
          type: 'feature',
          properties: {},
          geometry: {
            type: 'polygon',
            coordinates: [[]],
          }
        },
      },
    };
  },
  watch: {
    note: function (newValue) {
      this.property_form_mixin_setDirty();
    },
    'mint.uncertain'(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          // When the map is hidden, it will have the wrong size set
          // therefore we need to make the ap aware of the visibility change
          // by calling the following function.
          //
          // v-if would work as expected out of the box, but would result in other
          // issues
          if (this.$refs.uncertainLocation)
            this.$refs.uncertainLocation.sizeChanged();
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#uncertain-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
}
</style>
