<template>
    <div
        class="drawer"
        :class="{ closed: !active }"
    >
        <div
            v-show="active"
            class="drawer-content"
        >
            <slot>
                <!-- Drawer content -->
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        active: { type: Boolean, required: true },
        height: { type: Number, default: 100 },
        transitionTime: {
            type: Number,
            default: 300,
        },

    },
    mounted() {
        this.$nextTick(() => {
            this.$el.style.transition = `height ${this.transitionTime}ms`;
        });
    },
};
</script>
