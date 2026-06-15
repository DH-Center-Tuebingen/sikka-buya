<template>
    <div class="ottoman-treasure-table">
        <div
            class="close-button"
            @click="$emit('close')"
        >
            🗙
        </div>
        <header class="flex row">
            <div class="flex row">
                <h2>{{ treasure.name }}</h2>
                <div class="find-type">
                    {{ treasure.singleFind ? "Single Find" : "Hoard" }}
                </div>
            </div>
        </header>
        <table>
            <thead>
                <tr>
                    <th
                        v-for="column in columns"
                        :key="column.key"
                        :title="column.label"
                    >
                        {{ column.label }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(item, index) in treasure.originalItems"
                    :key="index"
                    :class="{'row-in-filter': columns.some(column => inFilters(column, item))}"
                >
                    <td
                        v-for="column in columns"
                        :key="`${index}-${column.key}`"
                        :class="inFilters(column, item) ? 'in-filter' : ''"
                        :title="formatCell(column, item, index)"
                    >
                        <template v-if="column.key === 'index'">
                            <b style="opacity: 30%; margin-right: 1rem;">{{ formatCell(column, item, index) }}</b>
                        </template>
                        <template v-else>
                            {{ formatCell(column, item) }}
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { stringifyRange } from '../../utils/Range';

export default {
    props: {
        treasure: {
            type: Object,
            required: true
        },
        filters: {
            type: Object,
            required: false,
            default: () => ({})
        }
    },
    computed: {
        columns() {
            return [
                { label: '#', key: 'index' },
                { label: 'Quantity', key: 'count' },
                { label: 'Denomination', key: 'denominationText' },
                { label: 'Material', key: 'material', object: 'name' },
                { label: 'Issuer', key: 'person', object: 'name' },
                { label: 'Mint', key: 'mintRegion', object: 'name' },
                { label: 'Coin type reference', key: 'coinTypeText' },
                { label: 'Historical region of loss', key: 'historicalRegion', object: 'name' },
                // { label: 'Region of loss', key: 'regionOfLoss' },
                // { label: 'Year of minting', key: 'yearOfMint' },
                // { label: 'Year of loss', key: 'yearOfLoss' },
            ]
        }
    },
    methods: {
        inFilters(column, item) {
            const filterValue = [
                ...this.filters[column.key] ?? [],
                ... this.filters[column.key + "_and"] ?? []
            ]

            if (column.object) {
                const id = Number(item[column.key]?.id) ?? null

                console.log("Filter result:", filterValue.includes(id))
                return filterValue.includes(id)
            }
            else {
                return false;
            }
        },
        formatCell(column, item, index = null) {
            if(column.key === 'index') {
                return index + 1
            }

            if (column.object) {
                return item[column.key]?.[column.object] ?? "-"
            }
            else {
                return item[column.key]
            }
        }
    },
}
</script>

<style
    scoped
    lang="scss"
>
.ottoman-treasure-table {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 1rem;
    background-color: $white;
    border-radius: $border-radius;
    z-index: 10;
    overflow: auto;
    padding: $padding;
    pointer-events: all;
}

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
    margin-left: $padding
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: $padding;
}

th,
td {
    padding: 0.2rem 0.5em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

th {
    position: sticky;
    z-index: 1;
    top: calc($padding * -1);

    color: $white;
    background-color: $primary-color;
    text-align: left;
    padding-bottom: 0.5em;
}

tr:nth-child(2n+1) {
    background-color: whitesmoke;
}


.in-filter {
    background-color: rgba($primary-color, 0.2) !important;
    font-weight: bold;
}

.row-in-filter {
    background-color: rgba($primary-color, 0.1) !important;
}

.close-button {
    cursor: pointer;
    position: sticky;
    display: block;
    top: 0;
    line-height: 1;
    padding: $small-padding;
    z-index: 100;
    font-size: 1.2rem;
    border-radius: $border-radius;
    background-color: $white;
    float: right;
    transform: translateY(-5px);

    transition: background-color 0.3s, color 0.3s;

    &:hover {
        color: $white;
        background-color: rgba($primary-color, 1);
    }
}
</style>