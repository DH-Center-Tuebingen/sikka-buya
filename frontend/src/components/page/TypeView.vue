<template>
  <div class="type-view">
    <info
      :alwaysShow="!type.completed"
      type="warning"
      id="not-reviewed-warning"
    >
      <Locale path="warning.not_reviewed_warning" />
    </info>

    <header>
      <h1 class="gm2">{{ type.projectId }}</h1>

      <sikka-buya-button
        v-if="!type.excludeFromMapApp"
        :to="{
          name: 'Political Map',
          query: {
            year: type.yearOfMint,
            zoom: linkZoom,
            location: mintLocation,
            timelineActive: true,
            selectedRulers: null,
            selectedMints: [type.mint.id],
          },
        }"
      >
        <Locale path="map.show_map" />
      </sikka-buya-button>
    </header>

    <div
      v-if="type.donativ"
      id="donativ"
      class="box centered property gm4"
    >
      <catalog-property>
        <Locale path="property.donativ" />
      </catalog-property>
    </div>
    <div
      v-else
      class="blank gm4"
    ></div>

    <div
      v-if="type.procedure != 'pressed'"
      class="box centered property gm4"
    >
      <catalog-property> gegossen </catalog-property>
    </div>
    <div
      v-else
      class="blank gm4"
    ></div>

    <router-link
      v-if="$store.state.user"
      id="edit-button"
      :to="{ name: 'EditType', params: { id: type.id } }"
    >
      <button type="button">
        <EditIcon />
      </button>
    </router-link>

    <div
      class="property gm2"
      id="mint-container"
    >
      <catalog-property>
        <template #label>
          <locale path="property.mint" />
        </template>
        <div
          style="display: flex; align-items: center;"
          class="mint-property"
        >
          {{ printMintProperty() }}
          <sikka-buya-button
            v-if="mintHasLocation"
            :to="{
              name: 'Political Map',
              query: {
                timelineActive: false,
                location: mintLocation,
                zoom: linkZoom,
                selectedMints: [type.mint.id],
                selectedRulers: null,
              },
            }"
          >
            <Locale path="map.show_map" />
          </sikka-buya-button>
        </div>
      </catalog-property>
      <div class="property">
        <catalog-property>
          <template #label>
            <locale path="property.mint_as_on_coin" />
          </template>
          {{ printTypeProperty('mintAsOnCoin') }}
        </catalog-property>
      </div>
    </div>

    <div class="property gm2">
      <catalog-property>
        <template #label>
          <locale path="property.year_of_mint" />
        </template>
        {{ printYearProperty() }}
      </catalog-property>
    </div>

    <div class="force-grid grid-col-2 property gm2">
      <div
        v-for="(val, idx) of ['material', 'nominal']"
        v-bind:key="`property-${val}-${idx}`"
      >
        <catalog-property>
          <template #label>
            <locale :path="`property.${val}`" />
          </template>
          {{ printTypeProperty(val, 'name') }}</catalog-property>
      </div>
    </div>

    <div class="person-container gm1">
      <person-view
        :overlords="type.overlords"
        :issuers="type.issuers"
        :caliph="type.caliph"
        :heir="heir"
      />
    </div>

    <div
      class="person-container gm1"
      v-if="hasOtherPersons"
    >
      <catalog-property v-if="cutter.length > 0">
        <template #label>
          <locale
            :path="`typeview.cutter`"
            :count="2"
          />
        </template>
        <person-list
          :targetProps="['shortName', 'name']"
          :value="cutter"
        />
      </catalog-property>

      <catalog-property v-if="warden.length > 0">
        <template #label>
          <locale
            :path="`typeview.warden`"
            :count="2"
          />
        </template>
        <person-list
          :targetProps="['shortName', 'name']"
          :value="warden"
        />
      </catalog-property>

      <catalog-property v-if="donator.length > 0">
        <template #label>
          <locale
            :path="`typeview.donator`"
            :count="2"
          />
        </template>
        <person-list
          :targetProps="['shortName', 'name']"
          :value="donator"
        />
      </catalog-property>
    </div>

    <div
      v-for="(sideObj, sideIdx) in existingCoinSideProperties"
      :key="`coin-sides-${sideIdx}`"
      :class="coinSideClass(sideObj, existingCoinSideProperties.length)"
    >
      <catalog-property
        class="property coin-side-field"
        v-if="getFilledFields(sideObj.name).length > 0"
      >
        <catalog-property
          v-for="(val, idx) of getFilledFields(sideObj.name)"
          :key="`property-${val}-${idx}`"
        >
          <template #label>
            <locale :path="`property.${sideObj.name}.${val}`" />
          </template>
          <div v-html="type[sideObj.name][val]"></div>
        </catalog-property>
      </catalog-property>
    </div>

    <catalog-property
      v-if="type.cursive"
      class="coin-marks gm2"
    >
      <template #label>
        <locale path="property.cursive" />
      </template>
      <locale path="general.yes" />
    </catalog-property>

    <catalog-property
      v-if="htmlHasContent(type.specials)"
      :html="type.specials"
      class="gm1"
    >
      <template #label>
        <locale path="property.specials" />
      </template>
      {{ this.missingText }}
    </catalog-property>

    <div
      v-if="!type.literature"
      class="error"
    >
      Literatur und Anmerkungen konnte nicht geladen werden
    </div>
    <catalog-property
      v-else-if="htmlHasContent(type.literature)"
      :html="type.literature"
      class="gm2"
    >
      <template #label>
        <locale path="property.literature_and_remarks" />
      </template>
    </catalog-property>
    <catalog-property
      v-else
      class="gm2"
    >
      <template #label>
        <locale path="property.literature_and_remarks" />
      </template>
      {{ this.missingText }}</catalog-property>

    <catalog-property class="gm2">
      <template #label>
        <locale path="property.piece" />
      </template>
      <div
        v-if="!type.pieces"
        class="error"
      >Stücke wurden nicht geladen!</div>
      <div v-if="type.pieces && type.pieces.length == 0">
        {{ this.missingText }}
      </div>
      <div
        v-for="piece of type.pieces"
        :key="piece"
        class="piece"
      >
        <a
          :href="piece"
          target="_blank"
        >{{ piece }}
          <ExternalIcon :size="16" />
        </a>
      </div>
    </catalog-property>

    <catalog-property class="gm2">
      <template #info>
        <Locale path="bibliography.treadwell_2002" />
      </template>
      <template #label>
        <locale path="property.treadwell_id" />
      </template>
      {{ type.treadwellId ? type.treadwellId : missingText }}
    </catalog-property>
  </div>
</template>

<script>
import Person from '../../utils/Person';
import Text from '../../utils/Text';

import CatalogItem from '../catalog/CatalogItem.vue';
import LabeledField from '../display/LabeledField.vue';

import Gift from 'vue-material-design-icons/GiftOutline';
import Italic from 'vue-material-design-icons/FormatItalic.vue';
import CatalogProperty from '../catalog/CatalogProperty.vue';
import Row from '../layout/Row.vue';
import Web from '../../utils/Web';

import EditIcon from 'vue-material-design-icons/Pen.vue';
import ExternalIcon from 'vue-material-design-icons/OpenInNew.vue';

import Button from '../layout/buttons/Button.vue';
import PersonView from '../Person/PersonView.vue';
import PersonList from '../Person/PersonList.vue';
import StringUtils from '../../utils/StringUtils';
import SikkaBuyaButton from '../layout/buttons/SikkaBuyaButton.vue';
import URLParams from '../../utils/URLParams';
import { DefaultSettings } from '../../settings';
import Info from '../forms/Info.vue';
import Locale from '../cms/Locale.vue';

export default {
  name: 'TypeView',
  props: {
    type: {
      type: Object,
    },
  },
  components: {
    CatalogItem,
    EditIcon,
    ExternalIcon,
    LabeledField,
    Gift,
    Italic,
    CatalogProperty,
    Row,
    Button,
    PersonView,
    PersonList,
    SikkaBuyaButton,
    Info,
    Locale,
  },
  methods: {
    dynamicHeading() {
      return Text.pluralizer(...arguments);
    },
    getUndefinedString() {
      return 'Nicht Erfasst';
    },
    getTypeProperty(name) {
      if (!this.type || !this.type[name]) {
        return this.getUndefinedString();
      } else {
        return this.type[name];
      }
    },
    getTypePropertyKey(name, key = 'name') {
      let result = this.getTypeProperty(name);
      if (!result[key]) {
        return this.getUndefinedString();
      } else return result[key];
    },
    printTypeProperty(key, attr = null) {
      let value = this.missingText;

      if (this.type[key]) {
        if (typeof this.type[key] == 'object') {
          if (this.type[key][attr]) value = this.type[key][attr];
        } else {
          value = this.type[key];
        }

        if (typeof value == 'boolean') {
          value = value ? 'Ja' : 'Nein';
        }
        if (value == 'pressed') value = this.$tc('property.procedures.pressed');
        if (value == 'struck') value = this.$tc('property.procedures.struck');
      }
      return value;
    },
    addQuestionMarkToString(str) {
      return str + ' ?';
    },
    printMintProperty() {
      let str = '';

      if (this.type?.mint?.id) {
        str = this.printTypeProperty('mint', 'name');
      }

      if (this.type.mintUncertain) {
        str = this.addQuestionMarkToString(str);
      }

      return str.trim();
    },
    printYearProperty() {
      let str = '';

      if (this.type.yearOfMint != null) {
        str = this.printTypeProperty('yearOfMint', 'name');
      }

      if (this.type.yearUncertain) {
        str = this.addQuestionMarkToString(str);
      }

      return str.trim();
    },
    getFilledFields(str) {
      let result = [];
      if (this.type[str]) {
        result = Object.entries(this.type[str])
          .filter(([_, val]) => {
            return this.htmlHasContent(val);
          })
          .map(([key, val]) => key);
      }
      return result;
    },

    htmlHasContent(val) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(val, 'text/html');
      const text = doc.documentElement.innerText;
      return text !== '';
    },
    get(property) {
      return this[property];
    },
    getLogoFromPath(path) {
      const site = Web.extractDomainName(path);
      return site
        ? `/image/logos/${site}.png`
        : 'https://www.fint-ikmk.uni-tuebingen.de/ikmk/special/favicons/android-chrome-256x256.png';
    },

    mapText: function (val, num = 1) {
      let map = {
        overlords: 'overlord',
        year: 'mint_year',
        issuers: 'issuer',
        caliph: { property: 'role', value: 'caliph' },
      };

      if (map[val]) {
        if (typeof map[val] == 'object')
          val = `${map[val].property}.${map[val].value}`;
        else val = `property.${map[val]}`;
      } else val = `property.${val}`;

      return this.$tc(val, num);
    },
    coinSideClass(coinSideProperty, coinSideCount) {
      let classes = ['coin-side', coinSideProperty.name, 'gm' + coinSideCount];
      return classes.join(' ');
    },
  },
  computed: {
    warden: function () {
      return Person.getOtherPersonsByRoleName(this.type, 'warden');
    },
    cutter: function () {
      return Person.getOtherPersonsByRoleName(this.type, 'cutter');
    },
    donator: function () {
      return Person.getOtherPersonsByRoleName(this.type, 'donator');
    },
    heir: function () {
      return Person.getOtherPersonsByRoleName(this.type, 'heir')[0];
    },
    hasOtherPersons() {
      return this.type.otherPersons.length > 0;
    },
    coinSideProperties() {
      return [
        { name: 'avers', label: 'frontside', prefix: 'Avers-' },
        { name: 'reverse', label: 'backside', prefix: 'Revers-' },
      ];
    },
    existingCoinSideProperties() {
      const existing = [];
      this.coinSideProperties.forEach((property) => {
        if (this.getFilledFields(property.name).length > 0)
          existing.push(property);
      });
      return existing;
    },
    hasCoinSideContents() {
      let hasCoinSide = false;
      return hasCoinSide;
    },
    missingText() {
      return StringUtils.missingText;
    },
    mintHasLocation() {
      const val =
        this?.type &&
        this.type.excludeFromMapApp === false &&
        this.type?.mint?.location?.coordinates &&
        Array.isArray(this.type.mint.location.coordinates);

      return val;
    },
    mintLocation() {
      if (!this?.type?.mint?.location?.coordinates)
        return URLParams.toStringArray(DefaultSettings.Map.location);
      return URLParams.toStringArray(this.type.mint.location.coordinates);
    },
    linkZoom() {
      return 6;
    },
  },
};
</script>


<style lang="scss">
.type-view {
  ul {
    margin: 0;
    line-height: 1.5em;
  }
}

.type-view .coin-side .nameerty-label {
  text-align: center;
  margin: 0 auto;
}
</style>

<style lang="scss" scoped>
$columns: 4;

.type-view {
  margin-top: 2 * $padding;
  display: grid;
  gap: $padding;
  grid-template-columns: repeat($columns, 1fr);
}

.mint-property .sikka-buya-button {
  margin-left: 4 * $padding;
}

#not-reviewed-warning {
  position: sticky;
  top: 10px;
  grid-column: span $columns;
}

#mint-container {
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-row: span 2;

  align-items: stretch;
  // background-color: $white;
}

#donativ {
  border: $border;
  border-color: $primary_color;
  box-sizing: border-box;
}

h1 {
  font-size: 2rem;
  margin: 0;
  margin-left: $padding;

  align-self: center;
  // padding: 0 0 $padding 0;
}

.box {
  display: flex;
  background-color: $white;
  align-items: center;
  justify-content: center;
}

header {
  display: flex;
  align-items: center;
  grid-column: span 2;
  height: 80px;

  // margin-bottom: 1rem;
  >* {
    margin-right: $padding;
  }
}

.gm1 {
  grid-column: span $columns;
}

.gm2 {
  grid-column: span 2;
}

.gm4 {
  grid-column: span 1;
}

.gc {
  justify-content: center;
  align-self: center;
  color: $primary-color;
  text-align: center;
}

.coin-side {
  display: flex;
  flex-direction: column;

  .catalog-property {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

#edit-button {
  position: fixed;
  right: 5%;
  bottom: 5%;
  z-index: 1000;

  button {
    $size: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: $primary-color;
    width: $size;
    height: $size;
    color: $white;
    border-radius: math.div($size, 2);
    box-shadow: $strong-shadow;
  }
}

.piece {
  font-size: 1rem;

  &:not(:last-child) {
    margin-bottom: $padding;
  }

  a {
    display: inline-flex;
    align-items: center;
    font-weight: normal;
    line-height: 1.3rem;
    color: $black;
    text-decoration: underline;
  }

  .material-design-icon {
    margin-left: 0.5rem;
  }
}

.property {
  display: flex;
  border-radius: $small-border-radius;
}

.catalog-property {
  flex: 1;
}</style>

