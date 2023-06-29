<template>
    <HollowButton
        class="cms-publication-status"
        :class="state"
        :interactive="false"
    >
        <template v-if="state === PublicationStatus.Draft">
            <Icon
                :path="icons.clock"
                type="mdi"
                :size="size"
            />
            <Locale path="cms.draft" />
        </template>
        <template v-else-if="state === PublicationStatus.Scheduled">
            <Icon
                :path="icons.clock"
                type="mdi"
                :size="size"
            />
            <Locale path="cms.scheduled" />
        </template>
        <template v-else>
            <Icon
                :path="icons.newspaper"
                type="mdi"
                :size="size"
            />
            <Locale path="cms.published" />
        </template>
    </HollowButton>
</template>

<script>
import Publication from '../../models/publication';
import { PublicationStatus } from '../../models/publication';
import { isNumberOrNull } from '../../utils/Validators';
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
        pageTimestamp: {
            validator: isNumberOrNull
        },
        userTimestamp: {
            validator: isNumberOrNull
        },
        size: {
            type: Number,
            default: 16
        }
    },
    computed: {
        state() {
            const pub = new Publication(this.userTimestamp, this.pageTimestamp)
            return pub.status
        },
        PublicationStatus() {
            return PublicationStatus
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
}
</style>