<template>
    <div class="settings-input">
        <span>
            {{ label }}
        </span>
        <input
            :value="value"
            @input="$event => input($event)"
        />
        <input
            :value="value"
            type="text"
            readonly
        >
        <button>Apply</button>
    </div>
</template>

<script>
export default {
    props: {
        label: String,
        value: {
            validator: () => true
        }
    }
};
</script>

<style lang='scss' scoped>
.settings-input {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $padding;
}

input:read-only {
    background-color: $light-gray;
    pointer-events: none;
}
</style>