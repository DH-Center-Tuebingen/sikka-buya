<template>
    <div
        class="settings-input"
        :class="{ dirty: isDirty(), active }"
    >
        <span>
            {{ label }}
        </span>
        <input
            v-model="unsavedValue"
            v-if="active"
        />
        <input
            :value="value"
            type="text"
            readonly
        >
        <button
            v-if="active"
            @click="reset"
            :disabled="!isDirty()"
        >
            Reset
        </button>
        <button
            v-if="active"
            @click="remove"
        >
            Remove
        </button>
        <button
            v-if="active"
            :disabled="!isDirty()"
            @click="clicked"
        >Apply</button>
    </div>
</template>

<script>
import Query from '../../database/query';

export default {
    props: {
        active: Boolean,
        path: {
            type: String,
            require: true
        },
        label: String,
        value: {
            validator: () => true
        }
    },
    data() {
        return {
            unsavedValue: ""
        }
    },
    mounted() {
        this.unsavedValue = this.value
    },
    watch: {
        value(value) {
            this.unsavedValue = value
        }
    },
    methods: {
        async reload() {
            window.location.reload()
        },
        async clicked() {
            await Query.raw(`mutation UpdateSetting($path: String!, $value: String!) {updateSetting (path:$path, value:$value )}`, {
                path: this.path,
                value: this.unsavedValue
            })
            this.reload()
        },
        async remove() {
            if (window.confirm("Are you sure you want to remove this setting?")) {
                await Query.raw(`mutation DeleteSetting($path: String!) {deleteSetting (path:$path)}`, {
                    path: this.path
                })
            }
            this.reload()
        },
        input(event) {
            this.$emit('input', event.target.value);
        },
        isDirty() {
            return this.unsavedValue !== this.value
        },
        reset() {
            this.unsavedValue = this.value
        }
    }
};
</script>

<style lang='scss' scoped>
.settings-input {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    align-items: center;
    gap: $padding;
    padding: math.div($padding, 2) $padding;
    margin-left: -$padding;
    border-radius: $border-radius;
    box-sizing: border-box;
    border: 1px solid transparent;


    &.active {
        border-color: gray;
    }
}

input:read-only {
    background-color: $light-gray;
}

.dirty {
    input {
        border-color: red;
    }

}
</style>