<template>
    <div class="ottoman-treasure-description">
        <header class="flex row">
            <h2>{{ treasure.name }}</h2>
            <div class="flex row toolbar">
                <slot name="header" />
                <div class="find-type">
                    {{ treasure.singleFind ? "Single Find" : "Hoard" }}
                </div>
            </div>
        </header>
        <div
            v-for="def in definition"
            :key="def.label"
            class="d-flex row"
        >
            <strong>{{ def.label }}: </strong>
            <span>{{ def.value }}</span>
        </div>
    </div>
</template>

<script>
import { stringifyRange } from '../../utils/Range';

export default {
    props: {
        treasure: {
            type: Object,
            required: true
        }
    },
    computed: {
        definition() {
            return [
                { label: 'Subclassification', value: this.treasure.subclassification ?? "N/A" },
                { label: 'Quantity', value: this.treasure.totalCount ?? "N/A" },
                { label: 'Date of loss', value: stringifyRange(this.treasure.yearOfLoss) },
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
    align-items: flex-start;
    gap: $padding;
    justify-content: space-between;

    .toolbar {
        margin-bottom: $padding;
        gap: $padding;
        margin-right: $padding;
    }
}

h2 {
    margin-top: 0;
    margin-bottom: $small-padding;
}

.find-type {
    display: inline-block;
    font-style: italic;
    background-color: $primary-color;
    border-radius: $border-radius;
    color: $white;
    padding: $small-padding;
    font-weight: bolder;
    min-width: fit-content;
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
</style>