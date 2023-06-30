<template>
  <form
    class="types-page"
    submit.prevent=""
    novalidate="true"
  >
    <modal
      :active="confirmVisible"
      @close="() => forceRedirect(false)"
    >
      <confirmation @result="forceRedirect">Wollen Sie die Seite wirklich verlassen? Alle Änderungen gehen dabei
        verloren!</confirmation>
    </modal>
    <error-box :message="errorMessage" />
    <BackHeader :to="{ name: 'TypeOverview' }" />

    <Heading>{{ $tc('property.type') }}</Heading>
    <p>
      <router-link :to="{ name: 'Catalog Entry', params: { id: coin.id } }">In Typenkatalog anzeigen</router-link>
    </p>
    <LoadingSpinner v-if="loading" />
    <div
      v-if="!loading"
      class="loading-area"
    >
      <input
        id="type-id"
        type="hidden"
        name=""
        :value="coin.id"
      />
      <Row>
        <LabeledInputContainer>
          <template #label>
            <Locale path="property.project_id" />
          </template>
          <input
            id="type-project-id"
            v-model="coin.projectId"
            required
          />
        </LabeledInputContainer>

        <LabeledInputContainer>
          <template #label>
            <Locale path="property.treadwell_id" />
          </template>
          <input
            id="type-treadwell-id"
            v-model="coin.treadwellId"
          />
        </LabeledInputContainer>
      </Row>

      <Row>
        <LabeledInputContainer>
          <template #label>
            <Locale path="property.mint" />
          </template>
          <DataSelectField
            id="type-mint-field"
            table="Mint"
            attribute="name"
            v-model="coin.mint"
            @select="mintSelected"
          />
        </LabeledInputContainer>

        <LabeledInputContainer>
          <template #label>
            <Locale path="property.mint_as_on_coin" />
          </template>
          <RemovableInputField
            id="type-as-on-coin-field"
            v-model="coin.mintAsOnCoin"
          />
        </LabeledInputContainer>

        <Checkbox
          id="type-mint-uncertain"
          v-model="coin.mintUncertain"
        >
          <template #label>
            <Locale path="property.mint_uncertain" />
          </template>
        </Checkbox>
      </Row>
      <Row>
        <LabeledInputContainer>
          <template #label>
            <Locale path="property.material" />
          </template>
          <DataSelectField
            id="type-material-data-field"
            v-model="coin.material"
            table="Material"
            attribute="name"
          />
        </LabeledInputContainer>
        <LabeledInputContainer>
          <template #label>
            <Locale path="property.nominal" />
          </template>
          <DataSelectField
            id="type-nominal-data-field"
            v-model="coin.nominal"
            table="Nominal"
            attribute="name"
          />
        </LabeledInputContainer>
        <LabeledInputContainer>
          <template #label>
            <Locale path="property.purity" />
          </template>
          <removable-input-field
            id="type-purity"
            type="number"
            step="0.01"
            v-model="coin.purity"
            table="Nominal"
            attribute="name"
          />
        </LabeledInputContainer>
      </Row>
      <Row>
        <LabeledInputContainer>
          <template #label>
            <Locale path="property.year_of_mint" />
          </template>
          <RestrictedInputField
            id="type-year-of-type-field"
            v-model="coin.yearOfMint"
            pattern="^-?[0-9x]{0,3}$"
          />
        </LabeledInputContainer>

        <Checkbox
          id="type-year-uncertain"
          v-model="coin.yearUncertain"
        >
          <template #label>
            <Locale path="property.year_uncertain" />
          </template>
        </Checkbox>
      </Row>

      <Row>
        <Checkbox
          id="type-donativ"
          v-model="coin.donativ"
        >
          <template #label>
            <Locale path="property.donativ" />
          </template>
        </Checkbox>

        <Checkbox
          id="type-small"
          v-model="coin.small"
        >
          <template #label>
            <Locale path="property.small" />
          </template>
        </Checkbox>

        <LabeledInputContainer id="type-procedure-container">
          <template #label>
            <Locale path="property.procedure" />
          </template>
          <RadioButtonGroup
            id="type-procedure"
            :labels="productionLabels"
            :options="productionOptions"
            v-model="coin.procedure"
          ></RadioButtonGroup>
        </LabeledInputContainer>
      </Row>

      <FormList
        v-on:add="addIssuer"
        id="type-issuers-list"
      >
        <template #title>
          <Locale path="property.issuer" />
        </template>
        <div
          v-if="coin.issuers.length == 0"
          class="info"
        >
          <Locale
            path="warning.list_is_empty"
            :count="2"
          />
        </div>
        <FormListItem
          v-for="(issuer, issuer_idx) in coin.issuers"
          :key="'issuer-wrapper-key-' + issuer.key"
          v-on:remove="removeIssuer"
          :object="issuer"
        >
          <TitledPersonSelect
            name="isser"
            table="persons"
            attribute="name"
            :value="issuer"
            :key="`issuers-${issuer.key}`"
            @input="issuerChanged($event, issuer_idx)"
            queryCommand="searchPersonsWithoutRole"
          ></TitledPersonSelect>
          <div
            v-if="issuer.error"
            class="error invalid-error"
          >
            {{ issuer.error }}
          </div>
        </FormListItem>
      </FormList>
      <FormList
        id="type-overlord-list"
        v-on:add="addOverlord"
        class="overlords needs-spacing"
      >
        <template #title>
          <Locale
            path="property.overlord"
            :count="2"
          />
        </template>
        <template #description>
          <Locale path="info.overlords" />
        </template>
        <div
          v-if="coin.overlords.length == 0"
          class="info"
        >
          {{ $t('warning.list_is_empty') }}
        </div>
        <FormListItem
          v-for="(overlord, index) of coin.overlords"
          :key="'overlord-key-' + overlord.key"
          v-on:remove="removeOverlord"
          :object="overlord"
        >
          <div class="overlord-rank">{{ overlord.rank }}</div>
          <TitledPersonSelect
            name="overlord"
            :value="overlord"
            :key="`overlord-${overlord.key}`"
            @input="overlordChanged($event, index)"
            queryCommand="searchPersonsWithoutRole"
            :queryBody="['id', 'name']"
          />
          <div
            v-if="overlord.error"
            class="error invalid-error"
          >
            {{ overlord.error }}
          </div>
        </FormListItem>
      </FormList>

      <LabeledInputContainer>
        <template #label>
          <Locale
            path="role.caliph"
            :count="2"
          />
        </template>
        <DataSelectField
          id="type-caliph-field"
          v-model="coin.caliph"
          attribute="name"
          table="person"
          queryCommand="searchPersonsWithRole"
          :queryBody="['id', { role: ['id', 'name'] }, 'name']"
          :additionalParameters="{ include: ['caliph'] }"
        />
      </LabeledInputContainer>
      <FormList
        id="type-other-person-list"
        class="needs-spacing"
        v-on:add="addOtherPerson"
      >
        <template #title>
          <Locale path="property.additional_persons" />
        </template>
        <div
          v-if="coin.otherPersons.length == 0"
          class="info"
        >
          {{ $t('warning.list_is_empty') }}
        </div>

        <FormListItem
          v-for="(otherPerson, index) in coin.otherPersons"
          :key="'other-person-id-' + otherPerson.key"
          v-on:remove="removeOtherPerson"
          :object="otherPerson"
        >
          <DataSelectField
            table="person"
            attribute="name"
            :value="otherPerson"
            @input="otherPersonChanged($event, index)"
            :displayTextCallback="otherPersonsTextCallback"
            queryCommand="searchPersonsWithRole"
            :additionalParameters="{ exclude: ['caliph'] }"
            :queryBody="['id', { role: ['id', 'name'] }, 'name']"
          />
          <div
            v-if="otherPerson.error"
            class="error invalid-error"
          >
            {{ otherPerson.error }}
          </div>
        </FormListItem>
      </FormList>

      <hr />
      <Section title="Voderseite">
        <CoinSideField
          id="type-avers"
          ref="aversField"
          prefix="Av.-"
        >
          <template #title>
            <Locale path="property.sides.front" />
          </template>
        </CoinSideField>
      </Section>

      <hr />
      <Section title="Rückseite">
        <CoinSideField
          id="type-reverse"
          ref="reverseField"
          prefix="Rev.-"
        >
          <template #title>
            <Locale path="property.sides.back" />
          </template>
        </CoinSideField>
      </Section>

      <hr />

      <LabeledInputContainer :label="$t('property.specialities_and_variants')">
        <SimpleFormattedField
          ref="specialsField"
          id="type-specials"
        />
      </LabeledInputContainer>

      <Checkbox
        id="type-cursive"
        v-model="coin.cursiveScript"
      >
        <template #label>
          <Locale path="property.cursive_script" />
        </template>
      </Checkbox>

      <FormList
        @add="addCoinMark"
        class="coin-mark-list"
        id="type-coin-mark-list"
      >
        <template #title>
          <Locale
            path="property.coin_mark"
            :count="2"
          />
        </template>
        <div
          v-if="coin.coinMarks.length == 0"
          class="info"
        >
          {{ $t('warning.list_is_empty') }}
        </div>
        <FormListItem
          v-for="(coinmark, idx) in coin.coinMarks"
          :key="coinmark.key"
          :object="coinmark"
          @remove="removeCoinMark(idx)"
        >
          <DataSelectField
            type="text"
            table="CoinMark"
            attribute="name"
            v-model="coin.coinMarks[idx]"
          />
          <div
            v-if="coinmark.error"
            class="error invalid-error"
          >
            {{ coinmark.error }}
          </div>
        </FormListItem>
      </FormList>

      <FormList
        @add="addCoinVerse"
        class="coin-verse-list"
        id="type-coin-verse-list"
        v-if="coin.coinVerses"
      >
        <template #title>
          <Locale
            path="property.coin_verse"
            :count="2"
          />
        </template>
        <div
          v-if="coin.coinVerses.length == 0"
          class="info"
        >
          {{ $t('warning.list_is_empty') }}
        </div>
        <FormListItem
          v-for="(coinverse, idx) in coin.coinVerses"
          :key="coinverse.key"
          :object="coinverse"
          @remove="removeCoinVerse(idx)"
        >
          <DataSelectField
            type="text"
            table="CoinVerse"
            attribute="name"
            v-model="coin.coinVerses[idx]"
          />
          <div
            v-if="coinverse.error"
            class="error invalid-error"
          >
            {{ coinverse.error }}
          </div>
        </FormListItem>
      </FormList>

      <FormList
        @add="addPiece"
        class="pieces-list"
        id="type-pieces-list"
      >
        <template #title>
          <Locale
            path="property.piece"
            :count="2"
          />
        </template>
        <div
          v-if="coin.pieces.length == 0"
          class="info"
        >
          {{ $t('warning.list_is_empty') }}
        </div>
        <FormListItem
          v-for="(piece, idx) in coin.pieces"
          :key="'pieces-' + piece.key"
          :object="piece"
          @remove="removePiece(idx)"
        >
          <input
            type="text"
            class="pieces-input"
            v-model="coin.pieces[idx].value"
            @input="pieceChanged(piece)"
          />
          <div
            v-if="piece.error"
            class="error invalid-error"
          >
            {{ piece.error }}
          </div>
        </FormListItem>
      </FormList>

      <LabeledInputContainer>
        <template #label>
          <Locale path="property.literature_and_remarks" />
        </template>
        <SimpleFormattedField
          id="type-literature-field"
          ref="literatureField"
        />
        <!-- <textarea v-model="coin.literature"></textarea> -->
      </LabeledInputContainer>

      <LabeledInputContainer>
        <template #label>
          <Locale path="property.internal_notes" />
        </template>
        <SimpleFormattedField
          id="type-internal-notes-field"
          ref="internalNotesField"
        />
        <!-- <textarea v-model="coin.literature"></textarea> -->
      </LabeledInputContainer>

      <Row>
        <Checkbox
          id="exclude-from-type-catalog"
          v-model="coin.excludeFromTypeCatalogue"
        >
          <template #label>
            <Locale path="property.excludeFromTypeCatalogue" />
          </template>
        </Checkbox>

        <Checkbox
          id="exclude-from-map-app"
          v-model="coin.excludeFromMapApp"
        >
          <template #label>
            <Locale path="property.excludeFromMapApp" />
          </template>
        </Checkbox>
      </Row>

      <div class="submit-error-window">
        <div
          class="error submit-error"
          v-for="err in errorMessages"
          :key="err.key"
        >
          {{ err.message }}
        </div>
      </div>

      <Row>
        <input
          type="file"
          @change="compareJSON"
          v-if="debug"
        />
        <button
          type="button"
          @click="applyJSON"
          v-if="debug"
        >
          Apply {{ debug }}
        </button>
        <button
          type="button"
          @click="exportJSON"
          v-if="debug"
        >Export</button>
        <button
          type="button"
          id="type-main-cancel-button"
          @click.stop.prevent="cancel"
        >
          {{ $t('form.cancel') }}
        </button>
        <button
          @click.stop.prevent="submitForm"
          id="type-main-submit-button"
          class="submit-button"
          type="submit"
          :disabled="submitDisabled"
        >
          {{ $t('form.submit') }}
        </button>
      </Row>
    </div>
  </form>
</template>

<script>
import Heading from '@/components/Heading.vue';
import DataSelectField from '@/components/forms/DataSelectField.vue';
import LabeledInputContainer from '@/components/LabeledInputContainer.vue';
import Row from '@/components/layout/Row.vue';
import RestrictedInputField from '../forms/RestrictedInputField.vue';
import Checkbox from '../forms/Checkbox.vue';
import RadioButtonGroup from '../forms/RadioButtonGroup.vue';
import FormList from '../forms/FormList.vue';
import FormListItem from '../forms/FormListItem.vue';
import TitledPersonSelect from '../forms/TitledPersonSelect.vue';
import CoinSideField from '../forms/coins/CoinSideField.vue';
import SimpleFormattedField from '../forms/SimpleFormattedField.vue';
import Query from '../../database/query.js';
import LoadingSpinner from '../misc/LoadingSpinner.vue';

import baseTemplate from '@/assets/template_types/base.json';
import RemovableInputField from '../forms/RemovableInputField.vue';
import AxiosHelper from '../../utils/AxiosHelper';
import ErrorBox from './system/ErrorBox.vue';

import { TypeQueries } from '../../graphql/type-queries';
import Modal from '../layout/Modal.vue';
import Confirmation from '../misc/Confirmation.vue';
import BackHeader from '../layout/BackHeader.vue';
import Locale from '../cms/Locale.vue';


export default {
  name: 'CreateTypePage',
  components: {
    BackHeader,
    Checkbox,
    CoinSideField,
    Confirmation,
    DataSelectField,
    ErrorBox,
    Heading,
    LabeledInputContainer,
    FormList,
    FormListItem,
    LoadingSpinner,
    Locale,
    Modal,
    RadioButtonGroup,
    RemovableInputField,
    RestrictedInputField,
    Row,
    SimpleFormattedField,
    TitledPersonSelect,
  },
  computed: {
    submitDisabled() {
      return !(this.loaded && !this.submitted);
    },
    productionLabels() {
      return [
        this.$t('property.procedures.pressed'),
        this.$t('property.procedures.cast'),
      ];
    },
  },
  mounted() {
    window.onbeforeunload = function (event) {
      event.returnValue = 'Navigation prevented!';
      return '';
    };

    /**
     * Draft saving
     */
    // this.backupInterval = setInterval(() => {
    //   let coin = JSON.stringify(this.$data.coin);
    //   window.localStorage.setItem('coin', coin);
    //   console.log('Saved backup locally.');
    // }, 5000);

    if (!this.$data.coin.id) {
      /**
       * Draft loading
       */
      // let coinBackup = window.localStorage.getItem('coin');
      // if (coinBackup) {
      //   try {
      //     let coin = JSON.parse(coinBackup);
      //     this.$data.coin = coin;
      //     console.log(`Loaded backup: `, coin.projectId);
      //   } catch (e) {
      //     console.error('Could not restore backup from data.');
      //   }
      // }

      /**
       * Somehow the child object is not empties correctly.
       * Therefore we clone it here.
       */
      const reverse = Object.assign({}, baseTemplate.reverse);
      const avers = Object.assign({}, baseTemplate.avers);

      Object.assign(this.$data.coin, baseTemplate, {
        avers,
        reverse,
      });

      this.initFormattedFields.call(this);
    }
  },
  created() {
    let id = this.$route.params.id;
    if (id != null) {
      this.$data.coin.id = id;
      Query.raw(TypeQueries.get(id))
        .then((obj) => {
          if (
            obj.message &&
            obj.message.errors &&
            obj.message.errors.length > 0
          ) {
            this.errorMessage = obj.message.errors[0];
          } else {
            const type = obj.data.data.getCoinType;

            // Sorts the overlords appropriately
            if (!type.overlords) type.overlords = [];
            type.overlords.sort((a, b) => (a.rank > b.rank ? 1 : -1));

            type.overlords.forEach((overlord) => {
              overlord.key = this.key++;
              overlord.titles.forEach((title) => (title.key = this.key++));
              overlord.honorifics.forEach(
                (honorific) => (honorific.key = this.key++)
              );
            });

            if (!type.issuers) type.issuers = [];
            type.issuers.forEach((issuer) => {
              issuer.key = this.key++;
              issuer.titles.forEach((title) => (title.key = this.key++));
              issuer.honorifics.forEach(
                (honorific) => (honorific.key = this.key++)
              );
            });

            if (!type.otherPersons) type.otherPersons = [];
            type.otherPersons.forEach(
              (otherPerson) => (otherPerson.key = this.key++)
            );

            if (!type.pieces) type.pieces = [];
            type.pieces.forEach((piece, index) => {
              type.pieces[index] = { key: this.key++, value: piece };
            });

            if (!type.coinMarks) type.coinMarks = [];
            type.coinMarks.forEach((coinMark, index) => {
              if (coinMark == null)
                type.coinMarks[index] = { id: null, name: '' };
              type.coinMarks[index].key = this.key++;
            });

            /**
             * Provide them with an initial value.
             */
            type.mint = type.mint ? type.mint : { id: null, name: '' };
            type.material = type.material
              ? type.material
              : { id: null, name: '' };
            type.nominal = type.nominal ? type.nominal : { id: null, name: '' };
            type.caliph = type.caliph ? type.caliph : { id: null, name: '' };
            type.purity = type.purity ? type.purity.toString() : '';

            Object.assign(this.$data.coin, type);
            this.initFormattedFields();

            this.loaded = true;
          }
        })
        .catch((error) => {
          console.error(error);
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors
          ) {
            const errors = error.response.data.errors;
            this.errorMessage = errors.map((err) => err.message).join('\n');
          } else this.errorMessage = error;
        })
        .finally((this.loading = false));
    } else {
      this.loading = false;
      this.loaded = true;
    }
  },

  data() {
    return {
      debug: false,
      loaded: false,
      coin: {
        id: null,
        projectId: '',
        treadwellId: '',
        mint: { id: null, name: '' },
        mintAsOnCoin: '',
        material: { id: null, name: '' },
        nominal: { id: null, name: '' },
        yearOfMint: '',
        donativ: false,
        procedure: 'pressed',
        issuers: [],
        overlords: [],
        otherPersons: [],
        caliph: { id: null, name: '', role: null },
        avers: {
          fieldText: '',
          innerInscript: '',
          intermediateInscript: '',
          outerInscript: '',
          misc: '',
        },
        reverse: {
          fieldText: '',
          innerInscript: '',
          intermediateInscript: '',
          outerInscript: '',
          misc: '',
        },
        cursiveScript: false,
        coinMarks: [],
        coinVerses: [],
        pieces: [],
        purity: '',
        small: false,
        specials: '',
        excludeFromTypeCatalogue: false,
        excludeFromMapApp: false,
        internalNotes: '',
        yearUncertain: false,
        mintUncertain: false,
      },
      errorMessages: [],
      submitted: false,
      errorMessage: '',
      loading: true,
      productionOptions: ['pressed', 'cast'],
      key: 0,
      backupInterval: null,
      confirmVisible: false,
    };
  },
  beforeRouteLeave(to, from, next) {
    if (this.submitted) {
      window.onbeforeunload = null;
      next();
    } else {
      this.confirmVisible = true;
    }

    this.next = next;
  },
  methods: {
    compareJSON(event) {
      var input, file, fr;

      if (typeof window.FileReader !== 'function') {
        alert("The file API isn't supported on this browser yet.");
        return;
      }

      input = event.target;
      if (!input) {
        alert("Um, couldn't find the fileinput element.");
      } else if (!input.files) {
        alert(
          "This browser doesn't seem to support the `files` property of file inputs."
        );
      } else if (!input.files[0]) {
        alert("Please select a file before clicking 'Load'");
      } else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedText;
        fr.readAsText(file);
      }

      function receivedText(e) {
        let lines = e.target.result;
        var obj = JSON.parse(lines);
        window.loadedCoin = obj;
      }
    },
    applyJSON() {
      if (window.loadedCoin) {
        this.coin = window.loadedCoin;
        this.initFormattedFields();
      } else console.error('You must import a file first.');
    },
    exportJSON() {
      this.initFormattedFields();
      let data = JSON.stringify(this.coin);
      const blob = new Blob([data], { type: 'text/plain' });
      const e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
      a.download = 'test.json';
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initEvent('click');
      a.dispatchEvent(e);
    },
    guard() {
      return true;
    },
    forceRedirect(result) {
      if (this.next != null && result) {
        window.onbeforeunload = null;
        this.next();
      } else {
        this.confirmVisible = false;
        this.next = null;
      }
    },
    addError(msg) {
      this.errorMessages.push({
        message: msg,
        key: 'error-' + this.key++,
      });
    },
    cancel() {
      this.$router.push({ name: 'TypeOverview' });
    },
    reverseChanged(coinSideObject) {
      this.coin.reverse = coinSideObject;
    },
    issuerChanged(issuer, index) {
      delete issuer.error;
      this.coin.issuers.splice(index, 1, issuer);
    },
    addCoinMark() {
      this.coin.coinMarks.push({
        key: 'coin-mark-' + this.key++,
        id: null,
        name: '',
      });
    },
    addCoinVerse() {
      this.coin.coinVerses.push({
        key: 'coin-verse-' + this.key++,
        id: null,
        name: '',
      });
    },
    removeCoinMark(index) {
      this.coin.coinMarks.splice(index, 1);
    },
    removeCoinVerse(index) {
      this.coin.coinVerses.splice(index, 1);
    },
    addPiece() {
      this.coin.pieces.push({
        key: 'piece-' + this.key++,
        value: '',
      });
    },
    pieceChanged(piece) {
      delete piece.error;
    },
    removePiece(index) {
      this.coin.pieces.splice(index, 1);
    },
    addIssuer() {
      this.coin.issuers.push({
        key: 'issuer-' + this.key++,
        person: {
          id: null,
          name: '',
          role: '',
        },
        titles: [],
        honorifics: [],
      });
    },
    removeIssuer(item) {
      const idx = this.coin.issuers.indexOf(item);
      if (idx != -1) {
        this.coin.issuers.splice(idx, 1);
        this.coin.issuers.forEach((overlord, idx) => {
          overlord.rank = idx;
        });
      }
    },
    otherPersonsTextCallback(data) {
      let txt = data.name;

      if (data?.role?.name) {
        txt = `${txt} (${this.$tc('role.' + data.role.name)})`;
      }
      return txt;
    },
    initFormattedFields() {
      this.$refs.internalNotesField.setContent(this.coin.internalNotes);
      this.$refs.literatureField.setContent(this.coin.literature);
      this.$refs.specialsField.setContent(this.coin.specials);

      this.$refs.aversField.setFieldContent(this.coin.avers);
      this.$refs.reverseField.setFieldContent(this.coin.reverse);
    },
    addOverlord() {
      this.coin.overlords.push({
        key: 'overlord-' + this.key++,
        rank: this.coin.overlords.length + 1,
        id: null,
        name: '',
        titles: [],
        honorifics: [],
      });
    },
    addOtherPerson() {
      this.coin.otherPersons.push({
        id: null,
        key: this.key++,
        name: '',
        role: '',
      });
    },
    overlordChanged(overlord, index) {
      const old = this.coin.overlords[index];
      Object.assign(old, overlord);
      delete old.error;
      this.coin.overlords.splice(index, 1, old);
    },
    removeOverlord(item) {
      const idx = this.coin.overlords.indexOf(item);
      if (idx != -1) {
        this.coin.overlords.splice(idx, 1);
        this.coin.overlords.forEach((overlord, idx) => {
          overlord.rank = idx;
        });
      }
    },
    removeOtherPerson(item) {
      const idx = this.coin.otherPersons.indexOf(item);
      if (idx != -1) {
        this.coin.otherPersons.splice(idx, 1);
      }
    },
    mintSelected(mint) {
      if (!this.coin.mintAsOnCoin) {
        this.coin.mintAsOnCoin = mint.name;
      }
    },
    otherPersonChanged(otherPerson, index) {
      const op = this.coin.otherPersons[index];
      Object.assign(op, otherPerson);
      delete op.error;
      this.coin.otherPersons.splice(index, 1, op);
    },
    submitForm() {
      function validateTitledPerson(titledPerson) {
        let valid = true;
        let titledPersonError = '';

        if (!titledPerson.id) {
          titledPersonError +=
            'Person ist nicht valide. Geben Sie eine Person an oder löschen Sie das Element. \n';
          valid = false;
        }

        for (let i = 0; i < titledPerson.titles.length; i++) {
          if (!titledPerson.titles[i].id) {
            valid = false;
            titledPersonError += `Nicht alle Titel enthalten einen gültigen Wert enthalten. Passen Sie diesen an oder löschen Sie das Element! \n`;
            break;
          }
        }

        for (let i = 0; i < titledPerson.honorifics.length; i++) {
          if (!titledPerson.honorifics[i].id) {
            valid = false;
            titledPersonError += `Nicht alle Ehrennamen enthalten einen gültigen Wert enthalten. Passen Sie diesen an oder löschen Sie das Element! \n`;
            break;
          }
        }

        titledPerson.error = titledPersonError;
        return valid;
      }

      function validatePerson(person) {
        return !!person.id;
      }

      let invalid = false;
      this.errorMessages = [];

      if (this.coin.projectId == '') {
        this.addError(`ID muss angegeben werden!`);
        invalid = true;
      }

      this.coin.issuers.forEach((issuer, index) => {
        if (!validateTitledPerson(issuer)) {
          this.coin.issuers.splice(index, 1, issuer);
          invalid = true;
        } else {
          delete issuer.error;
        }
      });

      this.coin.overlords.forEach((overlord, index) => {
        if (!validateTitledPerson(overlord)) {
          overlord.error =
            'Person ist nicht valide. Geben Sie eine Person an oder löschen Sie das Element.';
          invalid = true;
          this.coin.overlords.splice(index, 1, overlord);
        } else {
          delete overlord.error;
        }
      });

      this.coin.otherPersons.forEach((otherPerson, index) => {
        if (!validatePerson(otherPerson)) {
          otherPerson.error =
            'Person ist nicht valide. Geben Sie eine Person an oder löschen Sie das Element.';
          invalid = true;
          this.coin.otherPersons.splice(index, 1, otherPerson);
        } else {
          delete otherPerson.error;
        }
      });

      const elementError =
        'Das Element ist nicht valide. Geben Sie ein Element an oder löschen Sie das Element.';

      this.coin.coinMarks.forEach((coinMark, index) => {
        if (coinMark.id == null) {
          coinMark.error = elementError;
          invalid = true;
          this.coin.coinMarks.splice(index, 1, coinMark);
        }
      });

      this.coin.pieces.forEach((piece, index) => {
        if (piece.value == '') {
          piece.error = elementError;
          invalid = true;
          this.coin.pieces.splice(index, 1, piece);
        } else {
          delete piece.error;
        }
      });

      if (invalid) {
        setTimeout(() => {
          const target = document.querySelector('.invalid-error');
          if (target) {
            target.scrollIntoView({
              block: 'start',
              behavior: 'smooth',
            });
          }
        }, 10);

        return;
      } else {
        const submitData = JSON.parse(JSON.stringify(this.$data.coin));

        submitData.internalNotes = this.$refs.internalNotesField.getContent();
        submitData.literature = this.$refs.literatureField.getContent();
        submitData.specials = this.$refs.specialsField.getContent();

        const purity = parseFloat(submitData.purity);
        submitData.purity = isNaN(purity) ? null : purity;

        submitData.avers = Object.assign(
          submitData.avers,
          this.$refs.aversField.getFieldContent()
        );
        submitData.reverse = Object.assign(
          submitData.reverse,
          this.$refs.reverseField.getFieldContent()
        );

        const operation =
          submitData.id == null ? this.addCoinType : this.updateCoinType;

        operation(submitData)
          .then((result) => {
            if (AxiosHelper.ok(result)) {
              this.submitted = true;
              this.$router.push({ name: 'TypeOverview' });
            } else {
              AxiosHelper.getErrors(result).forEach((err) =>
                this.addError(err)
              );
            }
          })
          .catch((errors) => {
            console.log(errors);
            errors.forEach((err) => this.addError(err));
          });
      }
    },

    addCoinType(data) {
      const variables = {
        projectId: data.projectId,
        treadwellId: data.treadwellId,
        mint: data.mint && data.mint.id ? data.mint.id : null,
        mintAsOnCoin: data.mintAsOnCoin,
        material: data.material && data.material.id ? data.material.id : null,
        nominal: data.nominal && data.nominal.id ? data.nominal.id : null,
        yearOfMint: data.yearOfMint,
        donativ: data.donativ,
        purity: data.purity === '' ? null : data.purity,
        small: data.small,
        procedure: data.procedure,
        issuers: data.issuers.map((issuer) => {
          return {
            person: issuer.id,
            titles: issuer.titles.map((title) => +title.id),
            honorifics: issuer.honorifics.map((honorific) => +honorific.id),
          };
        }),
        otherPersons: data.otherPersons.map((person) => person.id),
        overlords: data.overlords.map((overlord) => {
          return {
            person: overlord.id,
            rank: overlord.rank,
            titles: overlord.titles.map((title) => +title.id),
            honorifics: overlord.honorifics.map((honorific) => +honorific.id),
          };
        }),
        caliph: data.caliph && data.caliph.id ? data.caliph.id : null,
        avers: data.avers,
        reverse: data.reverse,
        cursiveScript: data.cursiveScript,
        coinMarks: data.coinMarks.map((coinMark) => coinMark.id),
        coinVerses: data.coinVerses.map((coinVerse) => coinVerse.id),

        literature: data.literature,
        pieces: data.pieces.map((piece) => {
          return piece.value;
        }),
        specials: data.specials || '',
        excludeFromTypeCatalogue: data.excludeFromTypeCatalogue,
        excludeFromMapApp: data.excludeFromMapApp,
        internalNotes: data.internalNotes,
        yearUncertain: data.yearUncertain,
        mintUncertain: data.mintUncertain,
      };

      return Query.raw(TypeQueries.add(), variables);
    },
    updateCoinType(data) {
      const variables = {
        id: data.id,
        projectId: data.projectId,
        treadwellId: data.treadwellId,
        mint: data.mint && data.mint.id ? data.mint.id : null,
        mintAsOnCoin: data.mintAsOnCoin,
        material: data.material && data.material.id ? data.material.id : null,
        nominal: data.nominal && data.nominal.id ? data.nominal.id : null,
        yearOfMint: data.yearOfMint,
        donativ: data.donativ,
        purity: data.purity === '' ? null : data.purity,
        small: data.small,
        procedure: data.procedure,
        issuers: data.issuers.map((issuer) => {
          return {
            person: issuer.id,
            titles: issuer.titles.map((title) => +title.id),
            honorifics: issuer.honorifics.map((honorific) => +honorific.id),
          };
        }),
        otherPersons: data.otherPersons.map((person) => person.id),
        overlords: data.overlords.map((overlord) => {
          return {
            person: overlord.id,
            rank: overlord.rank,
            titles: overlord.titles.map((title) => +title.id),
            honorifics: overlord.honorifics.map((honorific) => +honorific.id),
          };
        }),
        caliph: data.caliph && data.caliph.id ? data.caliph.id : null,
        avers: data.avers,
        reverse: data.reverse,
        cursiveScript: data.cursiveScript,
        coinMarks: data.coinMarks.map((coinMark) => coinMark.id),
        coinVerses: data.coinVerses.map((coinVerse) => coinVerse.id),
        literature: data.literature,
        pieces: data.pieces.map((piece) => {
          return piece.value;
        }),
        specials: data.specials || '',
        excludeFromTypeCatalogue:
          data.excludeFromTypeCatalogue == null
            ? false
            : data.excludeFromTypeCatalogue,
        excludeFromMapApp:
          data.excludeFromMapApp == null ? false : data.excludeFromMapApp,
        internalNotes: data.internalNotes,
        yearUncertain: data.yearUncertain || false,
        mintUncertain: data.mintUncertain || false,
      };

      return Query.raw(TypeQueries.update(), variables);
    },
  },
};
</script>

<style lang="scss">
.types-page {
  #type-procedure-container {
    flex: 2;
  }

  #type-pieces-list {
    .list-container button {
      padding: 0 10px;
    }

    .slot {
      display: flex;

      input {
        flex: 1;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.coin-side-field>*,
.loading-area>*:not(hr) {
  margin-bottom: $padding;
}

.invalid-error {
  position: absolute;
  z-index: 10;
  font-size: 0.85rem;
  top: 0;
  left: 0;
  width: 100%;
  padding: 5px 10px;
  box-sizing: border-box;
  transform: translateY(-100%);
}

.error {
  color: white;
  font-weight: bold;
  background-color: $red;
}

.submit-error {
  padding: 3px 10px;
  font-size: 0.75rem;
  background-color: $red;
  color: $white;
  border: 1px solid $dark-red;

  &:first-of-type {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }

  &:last-of-type {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
}

// .global.error.hidden {
//   top: 0;
//   transform: translate(-50%, -100%);
// }

// .global.error {
//   position: fixed;
//   top: $padding;
//   left: 50%;
//   padding: $padding 2 * $padding;
//   background-color: $red;
//   z-index: 100000;
//   border: 1px sold darken($red, 0.5);
//   transform: translate(-50%, 0);
//   border-radius: $border-radius;

//   transition-duration: 0.5s;
//   transition-property: transform, top;

//   >*:not(:last-child) {
//     margin-right: 20px;
//   }
// }

textarea {
  width: 100%;
  resize: none;
  min-height: 200px;
  padding: 2 * $padding;
  box-sizing: border-box;
}

h3,
label {
  text-transform: capitalize;
}

.types-page {
  margin-bottom: 50vh;

  >h3 {
    font-size: 2rem;
    font-weight: bold;
  }
}

.needs-spacing {
  margin: $padding 0;
}

.overlords .list-item .slot {
  display: flex;
  flex-direction: row;
  align-items: stretch;

  .titled-person-select {
    flex: 1;
  }
}

.overlord-rank {
  padding: 5px;
  display: flex;
  align-items: center;
}
</style>
