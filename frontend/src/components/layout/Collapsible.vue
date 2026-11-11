<template>
    <div
        class="collapsible"
        :class="collapsibleClasses"
    >
        <header
            class="collapsible-header"
            @click="toggleCollapse"
        >
            <div
                v-if="front"
                class="icon"
            >
                <ChevronUp v-if="!collapsed" />
                <ChevronDown v-if="collapsed" />
            </div>
            <div class="collapsible-header-content">
                <slot name="header" />
            </div>
            <div
                v-if="!front"
                class="icon"
            >
                <ChevronUp v-if="!collapsed" />
                <ChevronDown v-if="collapsed" />
            </div>
        </header>

        <div
            v-if="!collapsed"
            class="collapsible-content"
        >
            <slot />
        </div>
    </div>
</template>

<script>
import ChevronUp from 'vue-material-design-icons/ChevronUp';
import ChevronDown from 'vue-material-design-icons/ChevronDown';

export default {
    components: {
        ChevronUp,
        ChevronDown,
    },
    props: {
        collapsed: Boolean,
        front: Boolean,
    },
    computed: {
        collapsibleClasses() {
            return this.collapsed ? 'collapsed' : 'open';
        },
    },
    methods: {
        toggleCollapse: function () {
            this.$emit('toggled', !this.collapsed);

            if (this.collapsed) {
                this.$emit('close');
            } else {
                this.$emit('open');
            }
        },
    },
};
</script>

<style lang="scss">
.collapsible header {
    h4 {
        margin: $small-padding 0 !important;
        padding: math.div($padding, 2) $padding !important;
    }
}
</style>

<style
    lang="scss"
    scoped
>
.collapsible {
    // border-bottom: $border;
}

.collapsible header {
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
    position: relative;
    gap: $padding;
}

.collapsible-header-content {
    display: flex;
    flex: 1;
}

.collapsible-content {
    min-height: 1rem;
}

.icon {
    margin-left: auto;
}

.material-design-icon {
    display: block;
    display: flex;
    align-items: center;
}
</style>
