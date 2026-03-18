<template>
    <ButtonVue
        :class="{ pending }"
        class="async-button"
        :content-button="contentButton"
        :disabled="disabled"
        :colored="colored"
        :multiline="multiline"
        :no-stop="noStop"
        :type="type"
        @click="clicked"
    >
        <div
            v-if="pending"
            class="spinner"
            :class="{ show: pending }"
        >
            <loading-spinner :size="LoadingSpinnerSize.Small" />
        </div>
        <div
            class="text"
            :class="{ show: !pending }"
        >
            <slot />
        </div>
    </ButtonVue>
</template>

<script>
import LoadingSpinner from '../../misc/LoadingSpinner.vue';
import ButtonVue from './Button.vue';

export default {
    components: { ButtonVue, LoadingSpinner },
    props: {
        pending: Boolean,
        /**
         * Contentbutton doesn't use a filling, it just uses the
         * buttons content. Most likely a single icon.
         */
        contentButton: Boolean,
        /**
         * Disables the button and the ability to push it.
         */
        disabled: Boolean,
        /**
         * Displays the button in the accent color.
         */
        colored: Boolean,
        /**
         * Displays multiple elements below each other.
         */
        multiline: Boolean,
        /**
         * Prevent the default stopPropagation
         */
        noStop: Boolean,
        /**
         * The type of the button, e.g. submit for forms.
         */
        type: String,
    },
    methods: {
        clicked: function () {
            if (!this.pending) {
                this.$emit('click');
            }
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
.async-button {
    position: relative;
}

.async-button>* {
    opacity: 0;
    transition: opacity 0.3s;

    &.show {
        opacity: 1;
    }
}

.button>div {
    display: flex;
    justify-content: center;
    align-items: center;
}

.button.pending {
    background-color: color.adjust($color: $primary-color, $saturation: -15%);
    box-shadow: inset 1px 2px 3px rgba($color: #000000, $alpha: 0.2);
    cursor: not-allowed;
}

.spinner {
    color: white;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
</style>
