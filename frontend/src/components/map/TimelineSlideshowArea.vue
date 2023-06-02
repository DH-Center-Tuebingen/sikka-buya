<template>
    <div class="timeline-slideshow-area">
        <Grid
            class="toolbar ui-element-container"
            :columns="2"
        >
            <template #1>
                <ButtonVue
                    class="map-button"
                    :active="slideshow.active"
                    @click="() => (slideshow.active = !slideshow.active)"
                >
                    <template v-if="slideshow.active">
                        <Icon
                            type="mdi"
                            :path="icons.bookmark"
                            :size="headerIconSize"
                        />
                    </template>
                    <template v-else>
                        <Icon
                            type="mdi"
                            :path="icons.bookmarkOutline"
                            :size="headerIconSize"
                        />
                    </template>
                </ButtonVue>

                <ButtonVue
                    class="map-button"
                    :active="playing"
                    :disabled="!timelineActive"
                    @click="togglePlay"
                >
                    <template v-if="playing">
                        <Icon
                            type="mdi"
                            :path="icons.pause"
                            :size="headerIconSize"
                        />
                    </template>
                    <template v-else>
                        <Icon
                            type="mdi"
                            :path="icons.play"
                            :size="headerIconSize"
                        />
                    </template>


                </ButtonVue>

                <popup-activator
                    :targetWidth="280"
                    :noShadow="true"
                >
                    <template v-slot="{ active }">
                        <ButtonVue
                            class="map-button"
                            :active="active"
                            :noStop="true"
                        >
                            <Icon
                                type="mdi"
                                :path="icons.share"
                                :size="headerIconSize"
                            />
                        </ButtonVue>

                    </template>

                    <template v-slot:popup>
                        <h3>
                            <Locale path="map.share_view" />
                        </h3>

                        <copy-field :value="shareLink" />
                    </template>
                </popup-activator>


                <slot name="left" />


            </template>

            <template #2>
                <slot name="right" />
                <template v-if="allowToggle">
                    <ButtonVue
                        class="map-button"
                        :active="timelineActive"
                        @click="toggleTimeline"
                        v-if="timelineActive"
                    >
                        <Locale path="map.timeline.deactivate" />
                    </ButtonVue>
                    <ButtonVue
                        class="map-button"
                        :active="timelineActive"
                        @click="toggleTimeline"
                        v-else
                    >
                        <Locale path="map.timeline.active" />
                    </ButtonVue>
                </template>
            </template>
        </Grid>
        <Drawer :active="slideshow.active">
            <Slideshow
                class="ui-element"
                :storagePrefix="timelineName"
                ref="slideshow"
            />
        </Drawer>
        <Drawer :active="timelineActive">
            <Timeline
                class="ui-element"
                @input="timelineUpdated"
                @change="timelineChanged"
                :value="timelineValue"
                :from="timelineFrom"
                :to="timelineTo"
                ref="timeline"
            >

                <template #background>
                    <canvas
                        id="timeline-canvas"
                        ref="timelineCanvas"
                    > </canvas>
                    <!-- <slot name="background" /> -->
                </template>
            </Timeline>
        </Drawer>
    </div>
</template>

<script>

import Settings from '../../settings';

import Grid from '../Grid.vue';
import ButtonVue from '../layout/buttons/Button.vue';
import Drawer from '../misc/Drawer.vue';

import { mdiPlay, mdiPause, mdiShareVariant, mdiBookmarkBoxMultiple, mdiBookmarkBoxMultipleOutline, mdiBookmark, mdiBookmarkOutline } from "@mdi/js"
import Locale from '../cms/Locale.vue';
import PopupActivator from '../Popup/PopupActivator.vue';
import CopyField from '../forms/CopyField.vue';
import Slideshow from './slideshow/Slideshow.vue';
import Timeline from './timeline/Timeline.vue';
import TimelineDiagram from '../../models/timeline/TimelineChart';

import icons from "@/components/mixins/icons.js"


let slideshowSettings = new Settings(window, 'Slideshow');
const slideshow = slideshowSettings.load();

export default {
    components: { Drawer, Grid, ButtonVue, Locale, PopupActivator, CopyField, Slideshow, Timeline },
    props: {
        /**
         * The 'toggle' state of the timeline.
         * Hidden when false
         */
        timelineActive: {
            default: true,
            type: Boolean,
        },
        /**
         * The link that can be shared to reproduce the current view of the application.
         */
        shareLink: {
            type: String,
            require: true,
        },
        /**
         * Don't display the toggle if toggling should be prohibited.
         */
        allowToggle: {
            default: true,
            type: Boolean,
        },
        /**
         * Used as a prefix to save the timeline independently from other timelines.
         */
        timelineName: String,
        map: Object,
        timelineFrom: Number,
        timelineTo: Number,
        timelineValue: {
            validator: (value) => {
                return !isNaN(value) || value === "";
            },
        },
    },
    mixins: [icons({
        "bookmark": mdiBookmark,
        "bookmarkOutline": mdiBookmarkOutline,
        "play": mdiPlay,
        "pause": mdiPause,
        "share": mdiShareVariant
    })],

    data() {
        return {
            slideshow,
            headerIconSize: 18,
            playInterval: null,
            timelineDiagram: null,
            timelineResizeTimeout: null,
        }
    },
    watch: {
        slideshow: {
            handler() {
                slideshowSettings.save();
            },
            deep: true,
        },
        timelineFrom() {
            console.log("timelineFrom changed", this.timelineFrom, this.timelineTo)
            this.timelineDiagram.update({ timeline: { from: this.timelineFrom, to: this.timelineTo } })
        },
        timelineTo() {
            console.log("timelineTo changed", this.timelineFrom, this.timelineTo)
            this.timelineDiagram.update({ timeline: { from: this.timelineFrom, to: this.timelineTo } })
        },
    },
    computed: {
        playing() {
            return this.playInterval != null;
        }
    },
    mounted() {
        this.timelineDiagram = new TimelineDiagram(this.$refs.timelineCanvas, { from: this.timelineFrom, to: this.timelineTo });
        window.addEventListener('resize', this.resizeCanvas);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.resizeCanvas);
    },
    methods: {
        getTimeline() {
            return this.$refs.timeline;
        },
        resizeCanvas() {
            if (this.timelineResizeTimeout) clearTimeout(this.timelineResizeTimeout);
            this.timelineResizeTimeout = setTimeout(() => {
                this.timelineDiagram.updateSize();
                this.$emit("resize");
            }, 300);
        },
        toggleTimeline() {
            this.$emit('toggle', this.timelineActive);
        },
        togglePlay() {
            if (this.playing) this.stop();
            else this.start();
        },
        timelineUpdated(year) {
            this.timelineChanged(year);
        },
        timelineChanged(year, isPlaying = false) {
            // If the timeline is changed due to playing, don't stop the playing
            if (!isPlaying) this.stop()
            this.$emit("input", year)
        },
        start() {
            if (this.playInterval) this.stop();
            this.playInterval = setInterval(() => {
                if (this.$refs.timeline) {
                    const atMax = !this.$refs.timeline.up(true)
                    if (atMax)
                        this.stop();

                }
            }, 1500);
        },
        stop() {
            clearInterval(this.playInterval);
            this.playInterval = null;
        },
    }
};
</script>

<style lang="scss">
.toolbar {

    .column>.button,
    .column .popup-target>.button {
        // text-overflow: clip;
        // flex-wrap: nowrap;
        // overflow: hidden;

        >span {
            white-space: nowrap;
            min-width: 0;
            text-overflow: ellipsis;
        }
    }

}
</style>

<style lang='scss' scoped>
.timeline-slideshow-area {
    flex: 1;
    margin: $padding;
    margin-bottom: 20px;

    >*:not(:last-child):not(.closed) {
        margin-bottom: $padding ;
    }
}



.timeline {
    height: 100px;
}

.toolbar {
    margin-bottom: $padding;


}
</style>