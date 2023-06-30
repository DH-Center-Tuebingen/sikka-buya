<template>
    <div class="treasure-item-form">
        <input
            type="number"
            name=""
            id=""
            placeholder="num"
            v-model="value.count"
        >
        <input
            type="text"
            name=""
            id=""
            placeholder="name"
            v-model="value.name"
        />


        <DataSelect
            table="mint"
            :debug="true"
            v-model="value.mint"
        />
        <DataSelect
            table="dynasty"
            :debug="true"
            v-model="value.dynasty"
        />
        <DataSelect
            table="nominal"
            :debug="true"
            v-model="value.nominal"
        />
        <DataSelect
            table="material"
            :debug="true"
            v-model="value.material"
        />
        <Toggle v-model="value.fragment">
            <template #active>
                <Icon
                    :path="icons.checked"
                    :size="IconSize.Normal"
                    type="mdi"
                />
                <span>Fragment</span>
            </template>
            <template #inactive>
                <Icon
                    :path="icons.unchecked"
                    :size="IconSize.Normal"
                    type="mdi"
                />
                <span>Kein Fragment</span>
            </template>
        </Toggle>

        <DynamicDeleteButton @delete="$emit('delete')" />

    </div>
</template>

<script>
import Locale from '@/components/cms/Locale';
import DataSelect from '@/components/forms/DataSelectField';
import Toggle from '../../layout/buttons/Toggle.vue';
import IconMixin from "@/components/mixins/icon-mixin"
import DynamicDeleteButton from "@/components/layout/DynamicDeleteButton.vue"

import { mdiCheckboxBlankOutline, mdiCheckboxMarked } from '@mdi/js';

export default {
    mixins: [IconMixin({
        unchecked: mdiCheckboxBlankOutline,
        checked: mdiCheckboxMarked
    })],
    components: {
        DataSelect,
        DynamicDeleteButton,
        Locale,
        Toggle,
    },
    props: {
        value: {
            type: Object,
            required: true,
        },
    },
}
</script>

<style lang="scss">
.treasure-item-form {

    .toggle {
        align-items: center;
    }

    .data-select {
        min-width: 0;
    }
}
</style>


<style lang="scss" scoped>
.treasure-item-form {
    display: grid;
    grid-template-columns: 50px repeat(6, 1fr) 50px;
    background-color: white;
    border: 1px solid $light-gray;
    padding: 2px .5em;

    align-items: center;
    gap: .5em;

    min-width: 0;
    overflow: hidden;



    input {

        min-width: 0;
    }
}
</style>