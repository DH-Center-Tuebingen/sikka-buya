<template>
    <div class="labeled-input-container">
        <label>
            <slot name="label" /> {{ label }} {{ warning }}
        </label>
        <slot />
    </div>
</template>

<script>
export default {
    name: 'LabeledInputContainer',
    props: {
        label: {
            type: String,
            default: ''
        },
        warning: {
            type: String,
            default: ''
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style
    lang="scss"
    scoped
>
label {
    margin-bottom: $small-padding;
}

.labeled-input-container {
    display: flex;
    flex-direction: column;

    >*:not(:first-child) {
        flex: 1;
    }

    margin-bottom: $padding;
}
</style>