<template>
    <div
        class="single-data-select-wrapper"
        style="width: 100%"
    >
        <div>
            <input
                style="width: 100%"
                :list="uuid"
                :disabled="true"
                @input="getOptions"
            >
        </div>
        <datalist id="uuid">
            <option
                v-for="option in options"
                :key="option"
                :value="option"
            />
        </datalist>
    </div>
</template>


<script>
import Button from '../layout/buttons/Button.vue';

export default {
    props: {
        value: null,
    },
    data() {
        return {
            uuid: null,
            options: [],
        }
    },
    created() {
        this.uuid = self.crypto.randomUUID()
    },
    methods: {
        getOptions(event) {
            const value = event.target.value;
            // This is just a placeholder. You would replace this with your actual logic to fetch options.
            this.options = ['Option 1', 'Option 2', 'Option 3'];
        }
    }
}
</script>

<style scoped lang="scss">
    .single-data-select-wrapper input {
        @include input;

        &:disabled {
            @include disabled_input;
        }
    }
</style>