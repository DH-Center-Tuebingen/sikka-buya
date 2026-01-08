<template>
    <div
        v-if="errorMessages && errorMessages.length > 0"
        class="error-message"
    >
        <AlertCircle
            v-if="icon"
            class="icon"
        />
        <p
            v-for="(err, idx) in errorMessages"
            :key="'error-' + idx"
            class="error"
        >
            {{ err }}
        </p>
    </div>
</template>

<script>
import AlertCircle from 'vue-material-design-icons/AlertCircle';
export default {
    components: { AlertCircle },
    props: {
        icon: {
            type: Boolean,
            default: false,
        },
        error: {
            required: true,
            type: [String, Array],
        },
    },
    computed: {
        errorMessages() {
            return Array.isArray(this.error) ? this.error : [this.error];
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
.error-message {
    display: flex;
    align-items: center;
    padding: $padding;
    background-color: $red;
    border: 1px solid $dark-red;
    border-radius: 5px;

    .error {
        color: $white;
        margin:0;
    }
}

.icon {
    margin-right: $padding;
}
</style>
