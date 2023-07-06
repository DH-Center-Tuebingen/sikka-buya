<template>
    <div class="range-input">
        <input
            type="number"
            :step="step"
            :value="value.from"
            @input="updateMin"
        >
        <input
            type="number"
            :step="step"
            :value="value.to"
            @input="updateMax"
        >
    </div>
</template>

<script>
export default {
    props: {
        value: {
            validator: (value) => value instanceof Object && value.hasOwnProperty("from") && value.hasOwnProperty("to")
        },
        step: {
            type: Number,
            default: 1
        }
    },
    methods: {
        updateMin(event) {
            let value = this.value;
            value.from = event.target.value;
            this.$emit('input', value);
        },
        updateMax(event) {
            let value = this.value;
            value.to = event.target.value;
            this.$emit('input', value);
        }
    }
};
</script>

<style lang='scss' scoped>

.range-input {
    display: flex;
}

input {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px;
    margin: 0 4px;
    text-align: center;
}
</style>