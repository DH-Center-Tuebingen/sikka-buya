<template>
    <div class="multi-data-select-2d">
        <!-- TODO: Key is index -->
        <template v-for="(values, idx) of active">
            <div
                v-if="idx > 0"
                :key="`mda-${input.name}-(${idx})-separator`"
                class="between-groups-area"
            >
                <div
                    class="separator button"
                    @click="changeMode"
                    v-text="$t(`general.${mode.toLowerCase()}`)"
                />
                <ButtonVue @click.native="() => $emit('remove-group', idx)">
                    Unten Löschen
                </ButtonVue>
            </div>
            <multi-data-select
                :key="`mda-${input.name}-(${idx})`"
                :active="values"
                :additional-parameters="input.additionalParameters"
                :allow-mode-change="true"
                :attribute="input.attribute"
                :disable-remove-button="true"
                :display-text-callback="input.displayTextCallback"
                :input="(...args) => search(...args, idx)"
                :mode="childModeSign"
                :query-command="input.queryCommand"
                :query-body="input.queryBody"
                :table="input.name"
                :text="input.text"
                @select="(value) => $emit('select', value, idx)"
                @remove="(el) => $emit('remove', el, idx)"
                @change-mode="changeMode"
                @dynamic-change="() => $emit('dynamic-change')"
            />
        </template>
        <multi-data-select-add-button
            id="add-group-button"
            @click.native="() => $emit('add')"
        >
            <Locale path="ui.multidataselect2d.add_group" />
        </multi-data-select-add-button>
    </div>
</template>

<script>
import Locale from '../cms/Locale.vue';
import ButtonVue from '../layout/buttons/Button.vue';
import MultiDataSelect from './MultiDataSelect.vue';
import MultiDataSelectAddButton from './MultiDataSelectAddButton.vue';

export default {
    components: { MultiDataSelect, MultiDataSelectAddButton, ButtonVue, Locale },
    props: {
        active: Array,
        input: Object,
        mode: String,
        separator: String,
    },
    data() {
        return {
            searchValues: [],
        };
    },
    computed: {
        childModeSign() {
            return this.mode.toLowerCase() === 'and' ? 'or' : 'and';
        },
    },
    methods: {
        search(evt, idx) {
            this.searchValues[idx] = evt.value;
        },
        changeMode() {
            this.$emit('change-mode');
        },
    },
};
</script>

<style lang="scss">
.multi-data-select-2d {
    .separator {
        display: inline-flex;
        align-items: center;
        color: $white;
        min-height: 24px;
        background-color: $dark-green;
        border-radius: $border-radius;

        font-size: $xtra-small-font;
        font-weight: bold;

        text-transform: uppercase;
    }
}
</style>

<style
    lang="scss"
    scoped
>
.multi-data-select-2d {
    padding: $small-padding;
    border: $border;
    border-radius: $border-radius;
}

.between-groups-area {
    display: flex;
    justify-content: space-between;
    margin: $small-padding 0;

    >* {
        font-size: $xtra-small-font;
        padding: math.div($padding, 2) 2 * $padding;
    }
}

#add-group-button {
    margin-top: $small-padding;
    padding: 3px;
}
</style>
