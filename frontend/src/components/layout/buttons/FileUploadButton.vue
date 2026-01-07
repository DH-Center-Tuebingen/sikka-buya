<template>
    <label
class="button"
:class="{disabled: loading}"
>
        <Icon
v-if="loading"
type="mdi"
size="22"
:path="icons.loading"
class="loading"
/>
        <slot />
        <!-- <AsyncButton>
            <slot />

        </AsyncButton> -->
        <input
            ref="input"
            type="file"
            :name="$props.name"
            :accept="accept"
            @click="()=> $refs.input.value = ''"
            @change="change"
            @input="(event)=> $emit('input', event)"
        >
    </label>
</template>

<script>

import iconMixin from '../../mixins/icon-mixin.js'
import { mdiLoading } from '@mdi/js';

export default {
    mixins: [iconMixin({loading: mdiLoading})],
    props: {
        name: {
            type: String,
            default: 'file-upload'
        },
        loading: {
            type: Boolean,
            required: true
        },
        accept: {
            type: String,
            default: ''
        }
    },
    methods: {
        change(event) {
            this.$emit('change', event)
        }
    }
};
</script>

<style lang='scss' scoped>

.button {
    display: flex;
    gap: .5em;
}

input {
    display: none;
}

.loading {
    animation: spin 1s linear infinite;
}


</style>