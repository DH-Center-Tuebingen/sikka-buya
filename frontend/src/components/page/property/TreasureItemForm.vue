<template>
    <div class="treasure-item-form">
        <input
            type="number"
            name=""
            id=""
            :placeholder="$tc('general.count')"
            v-model="value.count"
        >

        <input
            type="text"
            name=""
            id=""
            :placeholder="$tc('property.year_of_mint')"
            v-model="value.year"
        >

        <DataSelect
            table="coinType"
            attribute="projectId"
            dataPath="coinType.types"
            query="query search($text: String){
                coinType(filters: {projectId:$text}) {
                    types{
                        id
                        projectId
                    }
                }
            }"
            v-model="value.coinType"
        >

        </DataSelect>

        <DataSelect
            table="mint"
            :debug="debug"
            v-model="value.mint"
        />
        <DataSelect
            table="dynasty"
            :debug="debug"
            v-model="value.dynasty"
        />
        <DataSelect
            table="nominal"
            :debug="debug"
            v-model="value.nominal"
        />
        <DataSelect
            table="material"
            :debug="debug"
            v-model="value.material"
        />
        <Toggle v-model="value.fragment">
            <template #active>
                <div>
                    <Icon
                        :path="icons.checked"
                        :size="IconSize.Normal"
                        type="mdi"
                    />
                </div>
            </template>
            <template #inactive>
                <div>
                    <Icon
                        :path="icons.unchecked"
                        :size="IconSize.Normal"
                        type="mdi"
                    />
                </div>
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
    data() {
        return {
            debug: false,
        }
    }
}
</script>

<style lang="scss">
.treasure-item-form {

    .toggle {

        align-items: center;

        span {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            min-width: 0;
        }
    }

    .data-select {
        min-width: 0;
    }
}
</style>


<style lang="scss" scoped>
.treasure-item-form {
    display: grid;
    background-color: white;
    border: 1px solid $light-gray;
    padding: 2px .5em;

    align-items: center;
    gap: .5em;



    input {

        min-width: 0;
    }
}
</style>