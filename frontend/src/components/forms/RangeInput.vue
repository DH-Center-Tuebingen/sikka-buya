<template>
    <div class="range-input">
        <input
            class="from"
            :step="step"
            :value="value.from"
            @beforeinput="validateNumber"
            @input="updateMin"
        >
        <span>–</span>
        <input
            class="to"
            :step="step"
            :value="value.to"
            @beforeinput="validateNumber"
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
            value.from = Number(event.target.value) || null;
            this.$emit('input', value);
        },
        updateMax(event) {
            let value = this.value;
            value.to = Number(event.target.value) || null;
            this.$emit('input', value);
        },
        validateNumber(event) {
            if (event.data === null || event.data.length && event.data.length === 0) {
                return; // Allow deletions
            }
            const char = String.fromCharCode(event.data.charCodeAt(0));
            if (!/[0-9]/.test(char)) {
                event.preventDefault();
            }
        }
    }
};
</script>

<style
    lang='scss'
    scoped
>
.range-input {
    display: flex;
    position: relative;


    input {
        min-width: 6ch;
    }

    .from {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right-width: 0;
    }

    .to {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left-width: 0;
    }

    span {
        display: block;
        background-color: $white;
        border: 1px solid #ccc;
        border-left-width: 0;
        border-right-width: 0;
        padding-left: $padding;
        padding-right: $padding;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

input {
    width: 100%;
    border: 1px solid #ccc;
    padding: 4px;
    border-radius: 4px;
    text-align: center;
}
</style>