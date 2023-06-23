<template>
    <HollowButton class="cms-publication-status" :class="state" :interactive="false">
        <template v-if="state === 'draft'">
            <Icon
                :path="icons.clock"
                type="mdi"
                :size="16"
            />
            <Locale path="general.draft" />
        </template>
        <template v-else-if="state === 'scheduled'">
            <Icon
                :path="icons.clock"
                type="mdi"
                :size="16"
            />
            <Locale path="general.scheduled" />
        </template>
        <template v-else>
            <Icon
                :path="icons.newspaper"
                type="mdi"
                :size="16"
            />
            <Locale path="general.published" />
        </template>
    </HollowButton>
</template>

<script>
import Locale from '../cms/Locale.vue';
import HollowButton from '../layout/buttons/HollowButton.vue';

import iconMixin from '../mixins/icon-mixin';

import { mdiClockOutline, mdiNewspaperVariantOutline } from '@mdi/js';

export default {
    components: {
    Locale,
    HollowButton
},
    mixins: [iconMixin({ clock: mdiClockOutline, newspaper: mdiNewspaperVariantOutline })],
    props: {
        value: {
            type: Number,
            reqired: true,
        }
    },
    computed: {
        state() {
            if(this.value <= 0){
                return 'draft';
            } else if(this.value > new Date().getTime()) {
                return 'scheduled';
            } else if(this.value <= new Date().getTime()) {
                return 'published';
            } else {
                return "draft"
            }
        }
    }
};
</script>

<style lang='scss' scoped>
    .draft {
        color: $yellow;
    }

    .scheduled {
        color: $purple;
    }

    .published {
        color: $blue;
    }

    .cms-publication-status {
        display: flex;
        gap: .25em;
        align-items: center;
        font-size: $small-font;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-left: 8px;
    }
</style>