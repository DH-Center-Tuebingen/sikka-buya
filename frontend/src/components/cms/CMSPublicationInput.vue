<template>
    <div class="cms-publication-input">
        <input
            v-if="schedule"
            type="date"
            :value="time_mixin_timestampToDateInputValue(value)"
            @input="input"
        >
        <template v-else>
            <span style="display: flex; gap: .5em;">{{
                time_mixin_formatDate(value)
            }}</span>

        </template>

        <Icon
            :path="(schedule) ? icons.removeClock : icons.clock"
            :size="18"
            type="mdi"
            @click.native="toggleSchedule"
        />


    </div>
</template>

<script>
// Mixins
import time from '../mixins/time-mixin';
import iconMixin from '../mixins/icon-mixin';

// Icons
import { mdiClockOutline, mdiClockRemoveOutline } from '@mdi/js';

export default {
    mixins: [time, iconMixin({ clock: mdiClockOutline, removeClock: mdiClockRemoveOutline })],
    data() {
        return {
            schedule: false,
        }
    },
    props: {
        value: {
            type: Number,
            required: true,
        }
    },
    methods: {
        toggleSchedule() {
            this.schedule = !this.schedule;
            if (this.value == 0 || isNaN(this.value)) {
                this.$emit('input', new Date().getTime());
            }
        },
        input(e) {
            const ts = this.time_mixin_dateInputValueToTimestamp(e.target.value)
            this.$emit('input', ts);
        }
    }

};
</script>

<style lang='scss' scoped>
.cms-publication-input {
    display: flex;
    gap: .25em;
    align-items: center;
    font-size: $small-font;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-left: 8px;

    input {
        font-size: $small-font;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
}
</style>