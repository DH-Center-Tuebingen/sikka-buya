<template>
  <div class="coin-side-field">
    <Heading v-if="title || $slots.title">
      <slot name="title" />{{ title }}
    </Heading>
    <LabeledInputContainer>
      <template #label>
        {{ prefix }}
        <Locale path="property.field_text" />
      </template>
      <SimpleFormattedField
ref="fieldTextField"
class="field-text"
/>
    </LabeledInputContainer>

    <LabeledInputContainer>
      <template #label>
        {{ prefix }}
        <Locale path="property.inner_inscript" />
      </template>
      <SimpleFormattedField
ref="innerInscriptField"
class="inner-inscript"
/>
    </LabeledInputContainer>

    <LabeledInputContainer>
      <template #label>
        {{ prefix }}
        <Locale path="property.intermediate_inscript" />
      </template>
      <SimpleFormattedField
        ref="intermediateInscriptField"
        class="intermediate-inscript"
      />
    </LabeledInputContainer>

    <LabeledInputContainer>
      <template #label>
        {{ prefix }}
        <Locale path="property.outer_inscript" />
      </template>
      <SimpleFormattedField
ref="outerInscriptField"
class="outer-inscript"
/>
    </LabeledInputContainer>

    <LabeledInputContainer>
      <template #label>
        {{ prefix }}
        <Locale path="property.misc" />
      </template>
      <SimpleFormattedField
ref="miscField"
class="misc"
/>
    </LabeledInputContainer>
  </div>
</template>

<script>
import LabeledInputContainer from '../../LabeledInputContainer';

import Heading from '@/components/Heading.vue';
import SimpleFormattedField from '../SimpleFormattedField.vue';
import Locale from '../../cms/Locale.vue';

export default {
  name: 'CoinSideField',
  components: { LabeledInputContainer, Heading, SimpleFormattedField, Locale },
  props: {
    title: {
      type: String,
    },
    prefix: {
      type: String,
      default: '',
    },
  },
  data: function () {
    return {};
  },
  methods: {
    setFieldContent({
      fieldText = '',
      innerInscript = '',
      intermediateInscript = '',
      outerInscript = '',
      misc = '',
    } = {}) {
      function centerWhenEmpty(text) {
        return text || "<div style='text-align: center;'><br></div>";
      }

      this.$refs.fieldTextField.setContent(centerWhenEmpty(fieldText));
      this.$refs.innerInscriptField.setContent(centerWhenEmpty(innerInscript));
      this.$refs.intermediateInscriptField.setContent(
        centerWhenEmpty(intermediateInscript)
      );
      this.$refs.outerInscriptField.setContent(centerWhenEmpty(outerInscript));
      this.$refs.miscField.setContent(centerWhenEmpty(misc));
    },
    getFieldContent() {
      return {
        fieldText: this.$refs.fieldTextField.getContent(),
        innerInscript: this.$refs.innerInscriptField.getContent(),
        intermediateInscript: this.$refs.intermediateInscriptField.getContent(),
        outerInscript: this.$refs.outerInscriptField.getContent(),
        misc: this.$refs.miscField.getContent(),
      };
    },
  },
};
</script>

<style lang="scss">
.coin-side-field {
  > * {
    margin-bottom: math.div($padding, 2);
  }

  header {
    > * {
      margin: auto;
    }
  }
}
</style>

<style lang="scss" scoped>
label {
  font-size: 0.9rem;
}

ul.circular-list {
  list-style-type: none;
  padding-left: 0;

  li {
    margin: 0;
    position: relative;

    input {
      width: 100%;
    }
  }
}

.inscript {
  text-align: center;
}
</style>
