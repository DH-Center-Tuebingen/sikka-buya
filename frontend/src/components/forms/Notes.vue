<template>
    <div
        class="notes"
        :class="{ open }"
    >
        <div
            class="button"
            @click="toggle"
        >
            <CommentIcon />
        </div>

        <div class="content">
            <h3>Notizen</h3>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="html" />
        </div>
    </div>
</template>


<script>
import CommentIcon from 'vue-material-design-icons/Comment.vue';
export default {
    components: {
        CommentIcon,
    },
    props: {
        html: String,
    },
    data() {
        return {
            open: false,
        };
    },
    methods: {
        toggle() {
            this.open = !this.open;
        },
    },
};
</script>


<style
    lang="scss"
    scoped
>
$button-width: 62px;

.notes {
    position: fixed;
    top: 13vh;
    right: 0;
    z-index: 1000000;
    height: 80vh;
    width: 420px;
    max-width: calc(100% - #{$button-width});
    transform: translateX(100%);
    transition: transform $long-transition-time;

    &.open {
        transform: translateX(0);
    }

    .button {
        background-color: $primary-color;
        color: $white;
        justify-content: flex-start;
        padding: $padding $padding * 2;
        width: $button-width;
        position: absolute;
        border: none;
        z-index: 1000;
        transform: translateX(calc(-100% + 5px));
        z-index: -1;
        box-shadow: $strong-shadow;
    }
}

.content {
    background-color: $white;
    border-bottom-left-radius: $border-radius;
    padding: $big-padding 2 * $big-padding;
    padding-top: 3 * $big-padding;
    box-shadow: $strong-shadow;

    h3 {
        position: absolute;
        font-size: $small-font;
        color: $gray;
        top: 0;
    }
}
</style>