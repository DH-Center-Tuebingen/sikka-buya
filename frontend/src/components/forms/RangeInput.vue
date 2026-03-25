<template>
    <div class="range-input">
        <input
            class="from"
            :step="step"
            :value="fromValue"
            @beforeinput="validateNumber"
            @input="updateFrom"
        >
        <button
            v-if="showUncertainty"
            style="width: 10px;"
            @click="toggleFromUncertain()"
        >
            {{ fromValueUncertain ? "?" : "." }}
        </button>
        <span>–</span>
        <button
            v-if="showUncertainty"
            style="width: 10px;"
            @click="toggleToUncertain()"
        >
            {{ toValueUncertain ? "?" : "." }}
        </button>
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
        showUncertainty: {
            type: Boolean,
            default: false
        },
        value: {
            validator: (value) => value instanceof Object && value.hasOwnProperty("from") && value.hasOwnProperty("to")
        },
        step: {
            type: Number,
            default: 1
        }
    },
    computed: {
        fromUncertain() {
            return this.value?.fromUncertain ? this.value.fromUncertain : false;
        },
        toUncertain() {
            return this.value?.toUncertain ? this.value.toUncertain : false;
        },
        fromValue() {
            return (this.value && this.value.from != null) ? this.value.from : "";
        },
        toValue() {
            return (this.value && this.value.to != null) ? this.value.to : "";
        },
        fromValueUncertain() {
            return this.value?.fromUncertain ? this.value.fromUncertain : false;
        },
        toValueUncertain() {
            return this.value?.toUncertain ? this.value.toUncertain : false;
        },
    },
    methods: {
        getDefaultValue() {
            return { from: null, to: null, fromUncertain: false, toUncertain: false };
        },
        updateFrom(event) {
            const value = Object.assign({}, this.value || this.getDefaultValue());
            value.from = event.target.value === '' ? null : Number(event.target.value);
            this.$emit('input', value);
        },
        updateTo(event) {
            const value = Object.assign({}, this.value || this.getDefaultValue());
            value.to = event.target.value === '' ? null : Number(event.target.value);
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
        },
        toggleFromUncertain() {
            const value = Object.assign({}, this.value || this.getDefaultValue());
            value.fromUncertain = !value.fromUncertain;
            this.$emit('input', value);
        },
        toggleToUncertain() {
            const value = Object.assign({}, this.value || this.getDefaultValue());
            value.toUncertain = !value.toUncertain;
            this.$emit('input', value);
        },
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

button {
    border-radius: 0;
}
</style>