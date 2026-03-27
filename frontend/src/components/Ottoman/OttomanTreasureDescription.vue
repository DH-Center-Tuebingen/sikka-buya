<template>
    <div class="ottoman-treasure-description">
        <header class="flex row">
            <h2>{{ treasure.name }}</h2>
            <div class="find-type">
                {{ treasure.singleFind ? "Single Find" : "Hoard" }}
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
                { label: 'Date of loss', value: this.treasure.dateOfLoss ?? "N/A" },
                { label: 'Circumstances of find', value: this.treasure.description ?? "N/A" },
                { label: 'Collection', value: this.treasure.collection ?? "N/A" },
                { label: 'Publication', value: this.treasure.publication ?? "N/A" },

            ]
        }
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
}

h2 {
    margin-top: 0;
    margin-bottom: $small-padding;
}

.find-type {
    display: inline-block;
    font-style: italic;
    margin-bottom: $padding;
    background-color: $primary-color;
    border-radius: $border-radius;
    color: $white;
    padding: $small-padding;
    font-weight: bolder;
    min-width: fit-content;
    margin-right: $padding;
}
</style>