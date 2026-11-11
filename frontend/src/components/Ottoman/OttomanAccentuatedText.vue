<template>
    <span class="find-type">
        {{ singleFind ? "Single Find" : "Hoard" }}
    </span>
</template>

<script>
export default {
    props: {
        singleFind: {
            type: Boolean,
            required: true
        }
    }
}
</script>

<style
    lang="scss"
    scoped
>
.find-type {
    font-size:1.3rem;
    color: $bright-primary-color;
    text-transform: uppercase;
    display: inline-block;
    font-style: italic;
    font-weight: bolder;

    margin-right: $padding;
}
</style>