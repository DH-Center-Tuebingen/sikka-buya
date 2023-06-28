<template>
    <HollowButton
        class="cms-publication-button"
        :class="{ published, scheduled: schedule, pending }"
        @click.native="handleClick"
        :interactive="interactive"
    >
        <Icon
            type="mdi"
            :path="icon"
            :size="16"
        />
        <Locale :path="locale" />
    </HollowButton>
</template>

<script>
/**
 * Props for the CMSPublicationButton component.
 * 
 * Note: The 'publishedTimestamp' defines the current, from the user set, publication date.
 * It is used to determine if the page is scheduled or not.
 * The 'lastPublishedTimestamp' defines the last successful publication date.
 * 
 * 
 * @typedef {Object} CMSPublicationButtonProps
 * @property {boolean} pending - Whether the publication is pending or not.
 * @property {number} publishedTimestamp - The timestamp of the current publication date.
 * @property {number} lastPublishedTimestamp - The timestamp of the last successful publication.
 */

import HollowButton from "../layout/buttons/HollowButton"
import Locale from "./Locale.vue"

import { mdiClockOutline, mdiLoading, mdiPublish, mdiPublishOff, mdiUpdate } from '@mdi/js';
import iconMixin from '../mixins/icon-mixin';

import { isNumberOrNull } from '../../utils/Validators'
import Publication from '../../models/publication';

export default {
    mixins: [iconMixin({
        clock: mdiClockOutline,
        publish: mdiPublish,
        unpublish: mdiPublishOff,
        loading: mdiLoading,
        redate: mdiUpdate
    })],
    props: {
        pending: Boolean,
        publishedTimestamp: {
            type: Number,
            validator: isNumberOrNull
        },
        lastPublishedTimestamp: {
            type: Number,
            validator: isNumberOrNull
        },
    },
    components: {
        HollowButton,
        Locale
    },
    methods: {
        handleClick() {
            const ts = this.publishedTimestamp
            const lastPublishedTimestamp = this.lastPublishedTimestamp

            if (!this.interactive) return
            else if (this.published && ts == lastPublishedTimestamp) this.$emit('unpublish')
            else this.$emit('publish')
        }
    },
    computed: {
        icon() {
            const ts = this.publishedTimestamp
            const lastPublishedTimestamp = this.lastPublishedTimestamp
            return (this.pending) ? this.icons.loading : (this.schedule) ? this.icons.clock : (!this.published) ? this.icons.publish : (ts === lastPublishedTimestamp) ? this.icons.unpublish : this.icons.redate
        },
        locale() {
            const pub = new Publication(this.publishedTimestamp, this.lastPublishedTimestamp)
            return `cms.${pub.action.toLowerCase()}`
        },
        schedule() {
            const ts = this.publishedTimestamp
            return ts && ts > new Date().getTime()
        },
        scheduled() {
            const ts = this.publishedTimestamp
            const lastPublishedTimestamp = this.lastPublishedTimestamp
            return ts && ts > new Date().getTime() && ts === lastPublishedTimestamp
        },
        published() {
            const ts = parseInt(this.lastPublishedTimestamp)
            return !isNaN(ts) && ts > 0
        },
        interactive() {
            return !this.pending
        }
    }
};
</script>

<style lang='scss' scoped>
.cms-publication-button {
    color: $blue;

    &.pending {
        color: $yellow;

        svg {
            animation: spin 1s linear infinite;
        }
    }

    &.scheduled {
        color: $purple;
    }
}
</style>