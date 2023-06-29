<template>
    <div
        class="button hollow-button"
        :class="{ interactive }"
    >
        <div class="slot">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        interactive: {
            type: Boolean,
            default: false,
        },
    }
};
</script>

<style lang='scss' scoped>
.hollow-button {

    font-size: $small-font;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 0;
    border: none;
    background-color: transparent;

    :hover,
    :active {
        color: currentColor;
        border-color: currentColor;
    }


    cursor: default;
    user-select: all;
}

.slot {
    display: flex;
    align-items: center;
    gap: .5em;
}


.hollow-button.interactive {
    cursor: pointer;
    user-select: none;

    border: 1px solid currentColor;
    background-color: transparent;
    border-radius: 3px;

    // .slot {
    //     color: white;
    // }
}
</style>