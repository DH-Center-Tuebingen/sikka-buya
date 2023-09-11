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
        :interactive="false"
        :only="['point']"
        v-model="mint.location"
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
          :only="['polygon', 'circle']"
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


export default {
  components: {
    Checkbox,
    PropertyFormWrapper,
    LocationInput,
    DataSelectField,
    LabeledInputContainer,
  },
  name: 'MintForm',
  created: function () {
    let id = this.$route.params.id;
    if (id != null) {
      Query.raw(
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
              }
      `
      )
        .then((result) => {
          this.disabled = false;
          let data = result.data.data.getMint;
          this.note = result.data.data.getNote;

          if (!data.location) {
            data.location = {
              type: 'Point',
              coordinates: null,
            };
          }

          if (!data.uncertainArea) {
            data.uncertainArea = {
              type: 'Polygon',
              coordinates: [[]],
            };
          }

          data.uncertainArea.coordinates = data.uncertainArea.coordinates[0];

          this.mint = data;
        })
        .catch((err) => {
          this.$data.error = this.$t('error.loading_element');
          console.error(err);
        })
        .finally(() => {
          this.$data.loading = false;
        });
    } else {
      this.disabled = false;
      this.$data.loading = false;
    }
  },
  computed: {
    isUpdate() {
      return !!this.mint?.id && this.mint.id > 0;
    },
    error() {
      return this.errors.join(' ');
    },
  },
  methods: {
    submit: async function () {
      this.errors = [];

      // There is one array missing in the input field.
      let { type, coordinates } = this.mint.uncertainArea;

      const location =
        !this.mint.location ||
          this.mint.location?.type == 'empty' ||
          this.mint.location.coordinates == null ||
          this.mint.location.coordinates.length < 2
          ? null
          : this.mint.location;

      const uncertainArea =
        !this.mint.uncertainArea ||
          this.mint.uncertainArea?.type == 'empty' ||
          this.mint.uncertainArea?.coordinates == null
          ? null
          : {
            type,
            coordinates: [coordinates],
          };
      if (uncertainArea && uncertainArea.type === 'polygon') {
        const lastIndex = uncertainArea.coordinates.length - 1;
        if (uncertainArea.coordinates.length > 0) {
          let polygon = uncertainArea.coordinates[0];

          if (Array.isArray(polygon) && polygon.length > 0) {
            // The GeoJSON specification requires the first and last value to be the same
            // This will be enforced here.
            if (
              !polygon.every((val, idx) => {
                return val === uncertainArea.coordinates[0][lastIndex][idx];
              })
            )
              uncertainArea.coordinates[0].push(
                uncertainArea.coordinates[0][0]
              );

            if (polygon.length < 4) {
              // It is three points, as we add the last one if the first and last are not the same.
              this.errors.push('A polygon needs at least 3 points!');
            }
          }
        } else {
          this.errors.push('Uncertain area needs coordinates!');
        }
      }

      let data = {
        uncertain: this.mint.uncertain,
        name: this.mint.name,
        location,
        uncertainArea,
        province: this.mint.province?.id,
      };

      let id;
      if (this.mint.id == -1) {
        try {
          id = await this.query('addMint', data);
        } catch (e) {
          console.error(e);
          this.error += e;
        }
      } else {
        id = this.mint.id;
        data.id = id;

        await Query.raw(
          `
        mutation UpdateMint(
            $id:ID!,
            $name:String,
            $location:GeoJSON,
            $uncertain:Boolean,
            $uncertainArea:GeoJSON,
            $province:ID,
          ){
            updateMint(  
            id: $id,
            data: {
              name:$name,
            location:$location,
            uncertain:$uncertain,
            uncertainArea:$uncertainArea,
            province:$province,
            })
          }
  `,
          data,
          true
        ).catch((err) => {
          this.errors.push(err);
        });
      }

      if (id) {
        const query = `mutation UpdateNote($note:String, $id:ID!) {
        updateNote(text: $note, property:"mint", propertyId: $id)
        }`;

        try {
          await Query.raw(query, { note: this.note, id });
        } catch (e) {
          this.errors.push(e);
        }
      } else {
        this.errors.push(`Id could not be determined! Notes cant be updated.`);
      }
      if (this.errors.length === 0) {
        this.$router.push({
          name: 'Property',
          params: { property: 'mint' },
        });
      }
    },
    radiusChanged: function (radius) {
      this.radius = parseInt(radius);
    },
    query: async function (name, data = {}) {
      const body = GraphQLUtils.buildMutationParams(data);
      const query = `mutation {
        ${name}(data: ${body}) 
        }`;

      let result = {};
      try {
        let response = await Query.raw(query);
        result = response?.data.data[name];
      } catch (err) {
        this.error = this.$t(err);
        console.error(err);
      }

      return result;
    },
    cancel: function () {
      this.$router.push({ path: '/mint' });
    },
  },
  data: function () {
    return {
      dirty: false,
      errors: [],
      loading: true,
      radius: 1000,
      disabled: true,
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
          properties: { radius: 3000 },
          geometry: {
            type: 'point',
            coordinates: null,
          }
        },
      },
    };
  },
  watch: {
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
