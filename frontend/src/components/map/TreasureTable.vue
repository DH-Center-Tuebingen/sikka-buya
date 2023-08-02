<template>
    <div class="treasure-table">
        <h3>{{ item.name }}</h3>
        <div
            v-if="item.literature != ''"
            v-html="item.literature"
        />
        <table>
            <thead>
                <tr>
                    <TableSortButton
                        v-for="name of ['mint', 'count']"
                        :key="`head-${name}`"
                        :name="name"
                        :current="sortBy"
                        :desc="desc"
                        @input="sortingChanged"
                    >{{ name }}</TableSortButton>


                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="value of sortedItems"
                    :key="value.mint.id"
                >
                    <td>{{ value.mint.name }}</td>
                    <td>{{ value.count }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
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
            let map = this.items.reduce((acc, treasureItem) => {
                const mint = treasureItem.mint;
                if (mint && mint.id) {
                    if (!acc[mint.id])
                        acc[mint.id] = { count: 0, items: [], mint };
                    acc[mint.id].count += treasureItem.count;
                    acc[mint.id].items.push(treasureItem);
                }
                return acc;
            }, {});
            if (this.sortBy === "count") {
                return Object.values(map).sort((a, b) => {
                    if (!this.desc)
                        return a.count - b.count
                    else
                        return b.count - a.count;
                });
            }
            else {
                return Object.values(map).sort((a, b) => {

                    if (this.desc)
                        return b.mint.name.localeCompare(a.mint.name);
                    else
                        return a.mint.name.localeCompare(b.mint.name);
                });
            }
        }
    },
    components: { TableSortButton }
}
</script>

<style lang='scss' scoped>
h3 {
    margin-top: 0;
}

td,
td {
    padding: 0.1rem 0.25rem;
}

tr:nth-child(odd) {
    background-color: $dark-white;
}


.treasure-table {
    padding: $padding;
    background-color: white;
    border-radius: $border-radius;
    margin: $padding
}

table {
    border-collapse: collapse;
}
</style>