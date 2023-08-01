<template>
    <div class="actions-drawer">
        <div
            class="activator"
            @click="() => open = !open"
        >
            <Icon
                type="mdi"
                :path="icons.mdiDotsVertical"
                :size="22"
            />
        </div>
        <div
            class="actions-list"
            :class="alignClass"
            v-if="open"
        >
            <div
                class="action"
                v-for="action in actions"
                @click="() => select(action.name)"
                :key="action.name"
            >
                <Locale :path="action.label" />
            </div>
        </div>
    </div>
</template>

<script>


import Locale from '../cms/Locale.vue';
import iconMixin from '@/components/mixins/icon-mixin.js';
import { mdiDotsVertical } from '@mdi/js/mdi'

export default {
    components: { Locale },
    mixins: [
        iconMixin({ mdiDotsVertical })
    ],
    data() {
        return {
            open: false
        };
    },
    mounted() {
        this.$root.$on("global-click", this.close);
    },
    beforeDestroy() {
        this.$root.$off("global-click", this.close);
    },
    props: {
        actions: {
            type: Array,
            required: true
        },
        align: {
            type: String,
            default: "center",
            validator: (val) => ["left", "center", "right"].includes(val)
        }
    },
    methods: {
        select(action) {
            this.$emit("select", action);
            this.open = false;
        },
        close(event) {
            if (!this.$el.contains(event.target)) {
                this.open = false;
            }
        }
    },
    computed: {
        alignClass() {
            return `actions-list-${this.align}`;
        }
    },
};
</script>

<style lang='scss' scoped>
.actions-drawer {
    position: relative;
}

.activator {
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
}

.action {
    background-color: white;
    padding: .5em 1em;
    user-select: none;
    cursor: pointer;

    &:hover {
        filter: brightness(.98);
    }

    &:last-child {
        border-bottom-left-radius: $border-radius;
        border-bottom-right-radius: $border-radius;
    }

    &:first-child {
        border-top-left-radius: $border-radius;
        border-top-right-radius: $border-radius;
    }
}

.actions-list {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -100%);
    min-width: 150px;

    border-radius: $border-radius;
    box-shadow: $strong-shadow;

}

.actions-list-right {
    left: auto;
    right: 0;
    transform: translate(0, -100%);
}

.actions-list-left {
    left: auto;
    left: 0;
    transform: translate(0, -100%);
}
</style>