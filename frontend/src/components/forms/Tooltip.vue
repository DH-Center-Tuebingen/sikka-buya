<template>
    <span
        ref="tooltip"
        class="tooltip"
    >
        <slot />
    </span>
</template>

<script>
let interval
export default {
    mounted() {
        const tooltip = this.$refs.tooltip
        const rect = tooltip.getBoundingClientRect()
        const scrollbarWidth = 30

        let left = 0
        let top = 0
        if (rect.right > window.innerWidth - scrollbarWidth) {

            left = Math.ceil(window.innerWidth - scrollbarWidth - rect.right)

        }

        if (rect.top < 0) {
            top = rect.top * -1 + rect.height
        }

        tooltip.style.left = left + "px"
        tooltip.style.top = top + "px"
    }
};
</script>

<style lang='scss' scoped>
.tooltip {
    position: absolute;
    white-space: nowrap;
    transform: translateY(calc(-100% - 3px));
    top: 0;
    left: 0;
    pointer-events: none;
    background-color: white;
    border: $border;
    border-radius: 4px;
    font-weight: normal;
    color: $gray;
    padding: math.div($padding, 2) $padding;
    z-index: 1000000;
    font-size: $small-font;
}</style>