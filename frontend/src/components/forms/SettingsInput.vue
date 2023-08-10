<template>
    <div
        class="settings-input"
        :class="{ dirty: isDirty() }"
    >
        <span>
            {{ label }}
        </span>
        <input v-model="unsavedValue" />
        <input
            :value="value"
            type="text"
            readonly
        >
        <button @click="$emit('apply', unsavedValue)">Apply</button>
    </div>
</template>

<script>
export default {
    props: {
        label: String,
        value: {
            validator: () => true
        }
    },
    data() {
        return {
            unsavedValue: ""
        }
    },
    mounted() {
        this.unsavedValue = this.value
    },
    watch: {
        value(value) {
            this.unsavedValue = value
        }
    },
    methods: {
        input(event) {
            this.$emit('input', event.target.value);
        },
        isDirty()  {
            return this.unsavedValue !== this.value
        }
    }
};
</script>

<style lang='scss' scoped>
.settings-input {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    gap: $padding;
    padding: math.div($padding,2) $padding;
    border-radius: $border-radius;
    border: 1px solid gray;

}

input:read-only {
    background-color: $light-gray;
    pointer-events: none;
}

.dirty {
    color: red;
    border-color: red;

}
</style>