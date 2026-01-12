<template>
    <tr>
        <td
            v-for="definition in rowDefinition"
            :key="definition.label"
        >
            <div
                v-if="definition.type === 'index'"
                class="index-box"
            >
                <span>{{ index + 1 }}</span>
            </div>
            <ErrorMessage
                v-else-if="!value.hasOwnProperty(definition.attribute)"
                :error="'Missing value at: ' + definition.attribute"
            />
            <input
                v-else-if="definition.type === 'number'"
                v-model.number="value[definition.attribute]"
                type="number"
            >
            <input
                v-else-if="definition.type === 'text'"
                v-model="value[definition.attribute]"
                type="text"
            >
            <input
                v-else-if="definition.type === 'boolean'"
                v-model="value[definition.attribute]"
                type="checkbox"
            >
            <RangeInput
                v-else-if="definition.type === 'range'"
                v-model="value[definition.attribute]"
            />
            <DataSelectField
                v-else-if="definition.type === 'model'"
                v-model="value[definition.attribute]"
                :table="definition.table || definition.attribute"
            />
            <ErrorMessage
                v-else
                :error="'Unknown row definition type: ' + definition.type"
            />
        </td>
    </tr>
</template>

<script>
import RangeInput from '../forms/RangeInput.vue';
import ErrorMessage from '../ErrorMessage.vue';
import DataSelectField from '../forms/DataSelectField.vue';


export default {
    components: {
        DataSelectField,
        ErrorMessage,
        RangeInput,
    },
    props: {
        index: {
            type: Number,
            required: true
        },
        value: {
            type: Object,
            required: true
        },
        rowDefinition: {
            type: Array,
            required: true
        }
    },
    emits: ['update:modelValue'],
};

</script>

<style
    scoped
    lang="scss"
>
td {
    text-align: center;
    vertical-align: middle;
}
</style>