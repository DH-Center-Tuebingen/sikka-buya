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
            <span>
                <b>
                    <Locale path="time.created" />:
                </b> {{ time_mixin_formatDate(page.createdTimestamp) }}
            </span>
            <span>
                <b>
                    <Locale path="time.last_modified" />:
                </b> {{ time_mixin_formatDate(page.modifiedTimestamp) }}
            </span>
            <span>
                <b>
                    <Locale path="time.published" />:
                </b>
                <input
                    type="date"
                    :value="time_mixin_timestampToDateInputValue(page.publishedTimestamp)"
                    @input="updatePublished"
                >
            </span>
        </div>


        <AsyncButton
            v-if="!published"
            @click="() => $emit('publish', true)"
            :loading="saving"
        >
            <Locale path="general.publish" />
        </AsyncButton>
        <AsyncButton
            class="scheduled-indicator"
            @click="() => $emit('publish', false)"
            :loading="saving"
            v-else-if="scheduled"
        >
            <Icon
                :path="icons.clock"
                type="mdi"
                :size="16"
            />
            <Locale path="general.scheduled" />
        </AsyncButton>
        <AsyncButton
            class="published-indicator"
            @click="() => $emit('publish', false)"
            :loading="saving"
            v-else
        >
            <Icon
                :path="icons.published"
                type="mdi"
                :size="16"
            />
            <Locale path="general.published" />
        </AsyncButton>

        <AsyncButton
            v-if="canSave"
            @click="() => $emit('save')"
            :loading="saving"
        >
            <Locale path="general.save" />
        </AsyncButton>
        <div
            v-else-if="saving"
            class="saving-indicator"
        >
            <Locale path="general.saving" /> ...
        </div>
        <div
            v-else
            class="saved-indicator"
        >
            <Locale path="general.saved" />

        </div>


    </div>
</template>

<script>
import Locale from '../cms/Locale.vue';
import CMSStatusIndicator from '../page/cms/CMSStatusIndicator.vue';
import AsyncButton from '../layout/buttons/AsyncButton.vue';

// Mixins
import time from '../mixins/time-mixin';
import iconMixin from '../mixins/icon-mixin';

//icon-mixin.js
import { mdiNewspaperVariant, mdiCheck, mdiClockOutline } from '@mdi/js';

export default {
    mixins: [time, iconMixin({ published: mdiNewspaperVariant, check: mdiCheck, clock: mdiClockOutline })],
    components: {
        AsyncButton,
        CMSStatusIndicator,
        Locale,
    },
    props: {
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
            return this.page.publishedTimestamp !== null && this.page.publishedTimestamp !== "0";
        },
        scheduled() {
            return this.page.publishedTimestamp !== null && this.page.publishedTimestamp !== "0" && this.page.publishedTimestamp > Date.now();
        },
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

    .scheduled-indicator,
    .saved-indicator,
    .saving-indicator {
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
    padding: $padding;
    gap: $padding;

    background-color: $dark-white;
    border: 1px solid $red;
    border-radius: $border-radius;

    &.clean {
        border-color: $primary-color;
    }

    &.saving {
        border-color: $yellow;
    }
}

.stats {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

.slot {
    display: flex;
    gap: $padding;
}








.scheduled-indicator {
    $color: $purple;
    color: $color;
    border-color: $color;
    background-color: transparent;
}

.published-indicator {
    background-color: $blue;
}

.saving-indicator {
    color: $yellow;
}
</style>