<template>
    <div class="cms-publication-input">
        <input
            v-if="interactive"
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
            :path="(interactive) ? icons.removeClock : icons.clock"
            :size="18"
            type="mdi"
            @click.native="() => toggleInteractive()"
        />


    </div>
</template>

<script>
// Mixins
import time from '../mixins/time-mixin';
import iconMixin from '../mixins/icon-mixin';

// Icons
import { mdiClockEditOutline, mdiClockRemoveOutline } from '@mdi/js';

export default {
    mixins: [time, iconMixin({ clock: mdiClockEditOutline, removeClock: mdiClockRemoveOutline })],
    data() {
        return {
            interactive: false,
        }
    },
    props: {
        value: {
            type: Number,
            required: true,
        }
    },
    methods: {
        reset() {
            this.toggleInteractive(false);
        },
        toggleInteractive(value = null) {
            this.interactive = value == null ? !this.interactive : value;

            if (!this.interactive) this.$emit('reset')
            else if(!this.value) this.emitInput(new Date().getTime())
        },
        emitInput(value) {
            const ts = this.time_mixin_dateInputValueToTimestamp(value)
            this.$emit('input', ts);
        },
        input(e) {
            this.emitInput(e.target.value)
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