<template>
    <div class="range-input">
        <input
            class="from"
            :step="step"
            :value="fromValue"
            @beforeinput="validateNumber"
            @input="updateFrom"
        >
        <span>–</span>
        <input
            class="to"
            :step="step"
            :value="toValue"
            @beforeinput="validateNumber"
            @input="updateTo"
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
    computed: {
        fromValue() {
            return this.value?.from ? this.value.from : "";
        },
        toValue() {
            return this.value?.to ? this.value.to : "";
        }
    },
    methods: {
        updateFrom(event) {
            let value = this.value;
            if(!value) {
                value = { from: null, to: null };
            }
            value.from = Number(event.target.value) || null;
            this.$emit('input', value);
        },
        updateTo(event) {
            let value = this.value;
            if(!value) {
                value = { from: null, to: null };
            }
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
}
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