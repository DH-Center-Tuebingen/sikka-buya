<template>
    <label class="button" :class="{disabled: loading}">
        <Icon v-if="loading" type="mdi" size="22" :path="icons.loading" class="loading"/>
        <slot />
        <!-- <AsyncButton>
            <slot />

        </AsyncButton> -->
        <input
            type="file"
            :name="$props.name"
            ref="input"
            @click="()=> $refs.input.value = ''"
            @change="change"
            @input="(event)=> $emit('input', event)"
            :accept="accept"
        >
    </label>
</template>

<script>

import AsyncButton from './AsyncButton.vue';
import Button from './Button.vue';
import iconMixin from '../../mixins/icon-mixin.js'
import { mdiLoading } from '@mdi/js';


export default {
    components: { Button, AsyncButton },
    mixins: [iconMixin({loading: mdiLoading})],
    props: {
        name: {
            type: String,
            default: 'file-upload'
        },
        loading: {
            type: Boolean,
            default: false,
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