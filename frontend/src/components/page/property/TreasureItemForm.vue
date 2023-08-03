<template>
    <div class="treasure-item-form">
        <LabeledInputContainer>

            <template #label>
                <Locale path="property.count" />
            </template>

            <input
                type="number"
                name=""
                id=""
                :placeholder="$tc('property.count')"
                v-model="value.count"
            >
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="property.dynasty" />
            </template>

            <DataSelect
                table="dynasty"
                :debug="debug"
                v-model="value.dynasty"
            />
        </LabeledInputContainer>

        <LabeledInputContainer>
            <template #label>
                <Locale path="property.fragment" />
            </template>
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
        </LabeledInputContainer>

        <LabeledInputContainer>

            <template #label>
                <span>
                    <Locale path="property.weight" /> (g)
                </span>


            </template>

            <input
                type="number"
                step="0.01"
                name=""
                id=""
                :placeholder="$tc('property.weight')"
                v-model="value.weight"
            >
        </LabeledInputContainer>

        <div class="type-group">
            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.type" />
                </template>

                <DataSelect
                    table="coinType"
                    attribute="projectId"
                    dataPath="coinType.types"
                    query="query search($text: String){
                coinType(filters: {projectId:$text}) {
                    types{
                        id
                        projectId
                        yearOfMint
                        mint {
                            id
                            name
                        }
                        material {
                            id
                            name
                        }
                        nominal {
                            id
                            name
                        }
                    }
                }
            }"
                    @select="(value, data) => this.$emit('typeChanged', data)"
                    v-model="value.coinType"
                >

                </DataSelect>
            </LabeledInputContainer>

            <LabeledInputContainer>

                <template #label>
                    <Locale path="property.year_of_mint" />
                </template>

                <input
                    type="number"
                    name=""
                    id=""
                    :placeholder="$tc('property.yearOfMint')"
                    v-model="value.year"
                >
            </LabeledInputContainer>

            <LabeledInputContainer>

                <template #label>
                    <Locale path="property.year_of_mint_uncertain" />
                </template>

                <input
                    type="text"
                    name=""
                    id=""
                    :placeholder="$tc('property.yearOfMintUncertain')"
                    v-model="value.uncertainYear"
                >
            </LabeledInputContainer>

            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.mint" />
                </template>

                <DataSelect
                    table="mint"
                    :debug="debug"
                    v-model="value.mint"
                />
            </LabeledInputContainer>


            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.uncertain_mint" />
                </template>

                <input
                    type="text"
                    v-model="value.uncertainMint"
                >
            </LabeledInputContainer>


            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.nominal" />
                </template>

                <DataSelect
                    table="nominal"
                    :debug="debug"
                    v-model="value.nominal"
                />
            </LabeledInputContainer>

            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.material" />
                </template>
                <DataSelect
                    table="material"
                    :debug="debug"
                    v-model="value.material"
                />
            </LabeledInputContainer>

        </div>


        <DynamicDeleteButton
            class="delete-button"
            @delete="$emit('delete')"
        />

    </div>
</template>

<script>
import Locale from '@/components/cms/Locale';
import DataSelect from '@/components/forms/DataSelectField';
import Toggle from '../../layout/buttons/Toggle.vue';
import IconMixin from "@/components/mixins/icon-mixin"
import DynamicDeleteButton from "@/components/layout/DynamicDeleteButton.vue"
import LabeledInputContainer from "@/components/LabeledInputContainer"

import { mdiCheckboxBlankOutline, mdiCheckboxMarked } from '@mdi/js';

export default {
    mixins: [IconMixin({
        unchecked: mdiCheckboxBlankOutline,
        checked: mdiCheckboxMarked
    })],
    components: {
        DataSelect,
        DynamicDeleteButton,
        LabeledInputContainer,
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
    min-width: max-content;
    display: grid;
    grid-template-columns: 50px 100px 100px 100px min-content 50px;
}

.delete-button {
    justify-self: flex-end;
}

.type-group {
    display: grid;
    gap: 1em;
    border: 1px solid $light-gray;
    padding: math.div($padding, 2) $padding;

    grid-template-columns: repeat(7, 140px);
}

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