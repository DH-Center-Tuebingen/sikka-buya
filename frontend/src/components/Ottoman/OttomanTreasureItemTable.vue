<template>
    <div class="ottoman-treasure-item-table">
        <table style="min-width: 100%; ">
            <thead>
                <tr>
                    <th
                        v-for="heading in headings"
                        :key="heading"
                    >
                        {{ heading }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <OttomanTreasureItemTableRow
                    v-for="(item, index) in value"
                    :key="'ottoman-treasure-item-row-' + index"
                    :value="item"
                    :index="index"
                    :row-definition="rowDefinition"
                    @delete="deleteRow(item)"
                />
            </tbody>
        </table>
    </div>
</template>

<script>
import { OttomanTreasureItem } from './ottoman-treasure-item';

export default {
    components: {
        OttomanTreasureItemTableRow: () => import('./OttomanTreasureItemTableRow.vue'),
    },
    props: {
        value: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        headings() {
            return this.rowDefinition.map(def => def.label);
        },
        rowDefinition() {
            return OttomanTreasureItem.rowDefinition();
        }
    },
    methods: {
        deleteRow(item) {
            this.$emit("delete", item)
        }
    }
};

</script>


<style
    lang="scss"
    scoped
>
.ottoman-treasure-item-table {
    overflow-x: auto;
    border: 1px solid $border-color;
    border-radius: $border-radius;
    padding-left: $padding;
    padding-right: $padding;

    table {
        margin-bottom: 200px;
        border-collapse: collapse;
    }

    :deep(th),
    :deep(td) {
        padding: $small-padding;
    }

    :deep(th:nth-child(2n)),
    :deep(td:nth-child(2n)) {
        background-color: $light-gray;
    }
}
</style>