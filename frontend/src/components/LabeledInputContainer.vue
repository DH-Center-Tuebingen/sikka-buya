<template>
    <div class="labeled-input-container">
        <label :title="title">
            <slot name="label" />
            <span v-if="label">
                {{ label }}
            </span>
            <span
                v-if="warning"
                class="warning"
                :title="warning"
            >⚠️</span>
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
        title: {
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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