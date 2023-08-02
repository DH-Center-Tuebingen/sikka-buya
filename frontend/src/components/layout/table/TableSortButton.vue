<template>
    <th
        :class="{ active }"
        @click="input"
    >
        <div class="wrapper">
            <slot />
            <template v-if="active">
                <Icon
                    v-if="desc"
                    :path="icons.desc"
                    type="mdi"
                    :size="iconSize"
                ></Icon>
                <Icon
                    v-else
                    :path="icons.asc"
                    type="mdi"
                    :size="iconSize"
                ></Icon>

            </template>
        </div>

    </th>
</template>

<script>
import iconMixin from '../../mixins/icon-mixin';

import { mdiTriangle, mdiTriangleDown } from '@mdi/js';

export default {
    props: {
        name: { type: String, required: true },
        current: String,
        desc: Boolean
    }, data() {
        return {
            iconSize: 8
        }
    },
    methods: {
        input() {
            let desc = (this.active) ? !this.desc : false
            this.$emit('input', { name: this.name, desc })
        }
    },
    computed: {
        active() {
            return this.name === this.current
        }
    },
    mixins: [iconMixin({ asc: mdiTriangle, desc: mdiTriangleDown })]
};
</script>

<style lang='scss' scoped>
th {
    position: relative;
    border-collapse: collapse;
    user-select: none;

    &.active {
        .wrapper {
            font-weight: bold;
        }
    }
}

.wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $padding;

    cursor: pointer;
    border: 1px solid $light-gray;
    border-radius: 3px;
    padding: 0.25rem;
    background: linear-gradient(to bottom, #f9f9f9 0%, #e9e9e9 100%);
    font-weight: normal;


}
</style>