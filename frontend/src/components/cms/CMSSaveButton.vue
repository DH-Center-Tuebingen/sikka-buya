<template>
    <HollowButton
        class="cms-save-button"
        :interactive="dirty && !pending"
        :class="{ dirty, saving: pending }"
        @click.native="() => { if (dirty) $emit('save') }"
    >
        <CMSStatusIndicator
            :size="16"
            :dirty="dirty"
            :pending="pending"
        />

        <div
            v-if="dirty"
            class="save-indicator save-indicator-dirty"
        >
            <Locale path="general.save" />
        </div>
        <div
            v-else-if="pending"
            class="save-indicator save-indicator-saving"
        >
            <Locale path="general.saving" />
        </div>
        <div
            v-else
            class="save-indicator save-indicator-saved"
        >
            <Locale path="general.saved" />
        </div>
    </HollowButton>
</template>

<script>
//Components
import ActionsDrawer from '../interactive/ActionsDrawer.vue';
import AsyncButton from '../layout/buttons/AsyncButton.vue';
import CMSStatusIndicator from '../page/cms/CMSStatusIndicator.vue';
import HollowButton from '../layout/buttons/HollowButton.vue';
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
        HollowButton
    },
    data() {
        return {
            schedule: false,
        }
    },
    props: {
        autoSave: Boolean,
        saving: { required: true, type: Boolean },
        dirty: { required: true, type: Boolean }
    },
    computed: {
        pending() {
            return this.saving || (this.autoSave && this.dirty)
        }
    }
};
</script>

<style lang="scss">
.cms-save-button {

    &.dirty {
        color: $red;
    }
}
</style>

<style lang='scss' scoped>
.button {
    background-color: transparent;
    border-radius: 0;
}

.cms-save-button {




    >* {
        display: flex;
        align-items: center;
        padding: .25em .5em;
    }

    // &.dirty {
    //     color: white !important;

    //     .dirty-icon {}
    // }

    &.saving {
        color: $yellow;
    }
}
</style>