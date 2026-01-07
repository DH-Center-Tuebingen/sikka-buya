<template>
    <div>
        <labeled-property :label="$t('property.sides.front')">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="value.fieldText" />
        </labeled-property>

        <labeled-property
            v-if="hasText(value.innerInscript)"
            :label="$t('property.sides.inner_inscript')"
        >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="value.innerInscript" />
        </labeled-property>

        <labeled-property
            v-if="hasText(value.intermediateInscript)"
            :label="$t('property.sides.intermediate_inscript ')"
        >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="value.intermediateInscript" />
        </labeled-property>

        <labeled-property
            v-if="hasText(value.outerInscript)"
            :label="$t('property.sides.outer_inscript')"
        >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="value.outerInscript" />
        </labeled-property>

        <labeled-property
            v-if="hasText(value.misc)"
            :label="$t('property.sides.misc')"
        >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="value.misc" />
        </labeled-property>
    </div>
</template>

<script>
import LabeledProperty from "./LabeledProperty.vue";

export default {
    name: "CoinSideGroup",
    components: { LabeledProperty },
    props: {
        value: Object,
    },
    methods: {
        hasText: function (value) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(value, "text/html");
            return doc.body.textContent;
        },
    },
};
</script>
