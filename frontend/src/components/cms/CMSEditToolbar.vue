<template>
    <div
        class="cms-edit-toolbar"
        :class="{ clean: !dirty, saving }"
    >
        <CMSStatusIndicator
            
            :dirty="dirty"
            :pending="saving"
        />
        <div class="slot">
            <slot />
        </div>
        <div class="stats">
            <!-- <span>
                <b>
                    <Locale path="time.created" />:
                </b> {{ time_mixin_formatDate(page.createdTimestamp) }}
            </span>
            <span>
                <b>
                    <Locale path="time.last_modified" />:
                </b> {{ time_mixin_formatDate(page.modifiedTimestamp) }}
            </span> -->

        </div>

        <AsyncButton
            v-if="!published"
            @click="() => $emit('publish', true)"
            :loading="saving"
        >
            <Locale path="general.publish" />
        </AsyncButton>

        <template v-if="canSave">
            <div
                v-if="autoSave"
                class="save-indicator save-indicator-auto-save"
            >
                <Locale path="general.auto-save" />
            </div>
            <AsyncButton
                v-else
                @click="() => $emit('save')"
                :loading="saving"
            >
                <Locale path="general.save" />
            </AsyncButton>
        </template>
        <div
            v-else-if="saving"
            class="save-indicator save-indicator-saving"
        >
            <Locale path="general.saving" /> ...
        </div>
        <div
            v-else
            class="save-indicator save-indicator-saved"
        >
            <Locale path="general.saved" />
        </div>
        <ActionsDrawer
            v-if="actions.length > 0"
            :actions="actions"
            @select="(action) => $emit('action', action)"
            align="right"
        />


    </div>
</template>

<script>
//Components
import ActionsDrawer from '../interactive/ActionsDrawer.vue';
import AsyncButton from '../layout/buttons/AsyncButton.vue';
import CMSStatusIndicator from '../page/cms/CMSStatusIndicator.vue';
import Locale from '../cms/Locale.vue';

// Mixins
import time from '../mixins/time-mixin';
import iconMixin from '../mixins/icon-mixin';

// Icons
import { mdiClockOutline, mdiClockRemoveOutline } from '@mdi/js';

export default {
    mixins: [time, iconMixin({ clock: mdiClockOutline, removeClock: mdiClockRemoveOutline })],
    components: {
        ActionsDrawer,
        AsyncButton,
        CMSStatusIndicator,
        Locale,
    },

    props: {
        publishedTimestamp: Number,
        autoSave: Boolean,
        saving: { required: true, type: Boolean },
        dirty: { required: true, type: Boolean },
        page: { required: true, type: Object }
    },
    methods: {
        updatePublished(event) {
            const inputValue = event.currentTarget.value
            this.$emit("updatePage", "publishedTimestamp", new Date(inputValue).getTime().toString())
        }
    },
    computed: {
        canSave() {
            return this.dirty && !this.saving
        },
        published() {
            return this.publishedTimestamp;
        },
        actions() {
            const options = []

            const autoSaveAction = (this.autoSave) ? { name: "disable-auto-save", label: "cms.disable-auto-save" } : { name: "enable-auto-save", label: "cms.enable-auto-save" }
            const publishAction = (this.published) ? { name: "unpublish", label: "cms.unpublish" } : { name: "publish", label: "cms.publish" }

            return [
                autoSaveAction,
                publishAction
            ].sort((a, b) => this.$tc(a.label).localeCompare(this.$tc(b.label)))
        }
    }
};
</script>

<style lang="scss">
.cms-edit-toolbar {
    .published-indicator {
        display: flex;
        align-items: center;
        border-radius: $border-radius;
        padding: 0 $padding;
        color: $white;
        background-color: $blue;

        .text {
            gap: $padding;

        }
    }

    .save-indicator {
        display: flex;
        align-items: center;
        border-radius: $border-radius;
        padding: 0 $padding;
        color: $green;
        font-weight: bold;

        .text {
            display: flex;
            gap: $padding;

        }
    }

}
</style>

<style lang='scss' scoped>
.cms-edit-toolbar {
    position: sticky;
    z-index: 1000;
    top: $padding;
    display: flex;
    align-items: center;
    padding: math.div($padding, 2) $padding;
    gap: $padding;

    background-color: whitesmoke;
    border-bottom: 1px solid $red;
    // border-radius: $border-radius;

    .save-indicator {
        color: $red;
    }

    &.clean {
        border-color: $primary-color;

        .save-indicator {
            color: $primary-color;
        }
    }

    &.saving {
        border-color: $yellow;

        .save-indicator {
            color: $yellow;
        }
    }
}

.stats {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-evenly;

    span {
        display: inline-flex;
        align-items: center;
        gap: .5em;
    }

    svg {
        cursor: pointer;
        user-select: none;
    }
}

.slot {
    display: flex;
    gap: $padding;
}
</style>