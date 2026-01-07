<template>
    <div class="slide-row">
        <div class="icon">
            <component
:is="icon"
:size="14"
/>
        </div>
        <div class="text">
            {{ text }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        icon: String,
        text: String,
    }
};
</script>

<style lang='scss' scoped>
    .slide-row {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 3px; 
        font-size: $xtra-small-font;
    }

    .icon {
        color: $gray;
    }

</style>