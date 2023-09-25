<template>
    <div class="treasure-table">
        <div
            v-if="item.description != ''"
            v-html="item.description" 
        />
        <table>
            <thead>
                <tr>
                    <TableSortButton
                        v-for="(name) of ['mint', 'count', 'yearOfMint', 'weight', 'fragment']"
                        :key="`head-${name}`"
                        :name="name"
                        :current="sortBy"
                        :desc="desc"
                        @input="sortingChanged"
                    >
                        <Locale :path="`property.${$utils.snakeCase(name)}`" />
                    </TableSortButton>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(value, idx) of sortedItems"
                    :key="idx"
                >
                    <td>
                        {{ value.mint?.name }}
                    </td>
                    <td>
                        {{ value.count }}
                    </td>
                    <td>
                        {{ value.year }}
                    </td>
                    <td>
                        {{ value.weight }}g
                    </td>
                    <td>
                        <span v-if="value.fragment">x</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { Icon } from 'leaflet';
import Sort from '../../utils/Sorter';
import Locale from '../cms/Locale.vue';
import TableSortButton from '../layout/table/TableSortButton.vue'

export default {
    props: {
        item: Object
    },
    data() {
        return {
            sortBy: "mint",
            desc: false
        };
    },
    methods: {
        sortingChanged({ name, desc }) {
            this.sortBy = name;
            this.desc = desc;
        }
    },
    computed: {
        items() {
            return this.item?.items || [];
        },
        sortedItems() {
            window.i = window.i || 0;

            let items = [...Object.values(this.items).flatMap(i => i.items)]

            if (this.sortBy === "count") {
                return Object.values(items).sort((a, b) => {
                    if (!this.desc)
                        return a.count - b.count
                    else
                        return b.count - a.count;
                });
            }
            else if (this.sortBy === "mint") {
                let i = Object.values(items).sort(Sort.stringPropAlphabetically("mint.name", !this.desc));
                i.items = i.sort((a, b) => b.yearOfMint - a.yearOfMint);
                return i;
            } else throw new Error("Unknown sort by: " + this.sortBy);
        }
    },
    components: { TableSortButton, Locale, Icon }
}
</script>

<style lang="scss">
.treasure-table {

    overflow-x: auto;
    max-height: 300px;

    td {
        vertical-align: top;
        padding: 3px;
    }
}
</style>

<style lang='scss' scoped>
h3 {
    margin-top: 0;
}

td,
td {
    padding: 0.1rem 0.25rem;
}

tr:nth-child(odd) {
    background-color: $white;
}

tr:nth-child(even) {
    background-color: $dark-white;
}


.treasure-table {
    padding: $padding;
    background-color: white;
    // border-radius: $border-radius;
    margin: $padding
}

table {
    border-collapse: collapse;
    gap: 0;
}
</style>