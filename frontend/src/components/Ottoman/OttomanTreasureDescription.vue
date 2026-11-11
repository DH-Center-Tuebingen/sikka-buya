<template>
    <Collapsible
        :front="true"
        :collapsed="collapsed"
        @toggled="(state) => collapsed = state"
    >
        <template #header>
            <div class="collapsible-header-template flex row">
                <h2>
                    <OttomanAccentuatedText :single-find="treasure.singleFind" />
                    {{ treasure.name }}
                </h2>
                <div class="flex row toolbar">
                    <slot name="header" />
                </div>
            </div>
        </template>
        <article>
            <div
                v-for="def in definition"
                :key="def.label"
                class="d-flex row"
            >
                <strong>{{ def.label }}: </strong>
                <span>{{ def.value }}</span>
            </div>
        </article>
    </Collapsible>
</template>

<script>
import Collapsible from "@/components/layout/Collapsible"
import localStorageMixin from "../mixins/local-storage-mixin";
import OttomanAccentuatedText from "./OttomanAccentuatedText.vue";

export default {
    components: {
        Collapsible,
        OttomanAccentuatedText,
    },
    mixins: [localStorageMixin('ottoman-treasure-description-collapsible'), ['collapsed']],
    props: {
        treasure: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            collapsed: false,
        }
    },
    computed: {
        definition() {
            return [
                { label: 'Subclassification', value: this.treasure.subclassification ?? "N/A" },
                { label: 'Quantity', value: this.treasure.totalCount ?? "N/A" },
                { label: 'Date of loss', value: this.treasure.yearOfLossText ?? "N/A" },
                { label: 'Circumstances of find', value: this.treasure.description ?? "N/A" },
                { label: 'Collection', value: this.treasure.collection ?? "N/A" },
                { label: 'Publication', value: this.treasure.publication ?? "N/A" },

            ]
        },
    }
}
</script>

<style
    scoped
    lang="scss"
>
header {
    margin-top: $small-padding;
    margin-bottom: $small-padding;
    align-items: start;
    gap: $padding;
    justify-content: space-between;
    flex-wrap: nowrap;

    .toolbar {
        margin-left: auto;
        gap: $padding;
    }
}

article {
    padding-top: 2*$padding;
}

h2 {
    margin-top: 0;
    margin-bottom: 0;
}

th,
td {
    padding: 0.2em;
}

th {

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

tr:nth-child(2n+1) {
    background-color: whitesmoke;
}

.toolbar {
    align-items: center;
}

.collapsible-header-template {
    align-items: center;
    flex:1;
}
</style>