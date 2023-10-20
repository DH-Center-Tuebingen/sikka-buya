<template>
    <div class="treasure-item-form">

        <div class="box index-box">
            <span>
                {{ index }}
            </span>
        </div>
        <div class="fields">
            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.mint_region" />
                </template>

                <DataSelect
                    class="mint-region-data-select"
                    table="mint_region"
                    :debug="debug"
                    v-model="value.mintRegion"
                />
            </LabeledInputContainer>

            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.mintAsOnCoin" />
                </template>

                <input
                    class="mint-as-on-coin-input"
                    type="text"
                    v-model="value.mintAsOnCoin"
                >
            </LabeledInputContainer>


            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.epoch" />
                </template>

                <DataSelect
                    class="epoch-data-select"
                    table="epoch"
                    :debug="debug"
                    v-model="value.epoch"
                />
            </LabeledInputContainer>

            <LabeledInputContainer>
                <template #label>
                    <Locale path="property.fragment" />
                </template>
                <Toggle
                    v-model="value.fragment"
                    class="fragment-toggle"
                >
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
                    <Locale path="property.reconstructed" />
                </template>
                <Toggle
                    v-model="value.reconstructed"
                    class="reconstructed-toggle"
                >
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
                    <Locale path="property.mint-region-uncertain" />
                </template>
                <Toggle
                    v-model="value.mintRegionUncertain"
                    class="mint-region-uncertain-toggle"
                >
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
                    class="weight-input"
                    type="number"
                    step="0.01"
                    name=""
                    id=""
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
                        class="coin-type-data-select"
                    >

                    </DataSelect>
                </LabeledInputContainer>

                <LabeledInputContainer>

                    <template #label>
                        <Locale path="property.year_of_mint" />
                    </template>

                    <input
                        class="year-input"
                        type="number"
                        name=""
                        id=""
                        v-model="value.year"
                    >
                </LabeledInputContainer>

                <LabeledInputContainer>

                    <template #label>
                        <Locale path="property.year_of_mint_uncertain" />
                    </template>

                    <input
                        class="year-uncertain-input"
                        type="text"
                        name=""
                        id=""
                        v-model="value.uncertainYear"
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
                        class="nominal-data-select"
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
                        class="material-data-select"
                    />
                </LabeledInputContainer>

            </div>

            <LabeledInputContainer>

                <template #label>
                    <Locale path="property.count" />
                </template>

                <input
                    type="number"
                    name=""
                    id=""
                    v-model="value.count"
                    class="count-input"
                >
            </LabeledInputContainer>
        </div>
        <div class="box">
            <DynamicDeleteButton
                class="delete-button"
                @delete="$emit('delete')"
            />
        </div>

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
        index: {
            type: Number,
            required: true,
        },
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

    .labeled-input-container {
        label {
            margin-bottom: 0.1em;
        }
    }
}
</style>


<style lang="scss" scoped>
.treasure-item-form {
    display: flex;
}

.treasure-item-form:nth-child(2n) {

    .fields,
    .box {
        background-color: rgba($light-gray, 0.2);
    }

}

.labeled-input-container {
    margin-bottom: 3px;
}

.treasure-item-form .fields {
    min-width: max-content;
    display: grid;
    padding: 1px 5px;
    gap: 5px;
    grid-template-columns: 100px 100px 100px 70px 70px 70px 70px min-content 50px;

    >.labeled-input-container {
        padding-top: 2px;
        padding-bottom: 2px;
    }
}

.delete-button {
    justify-self: flex-end;
}

.type-group {
    display: grid;
    gap: 1em;
    border: 1px solid $light-gray;
    background-color: rgba($light-gray, 0.1);

    border-radius: $border-radius;
    padding: 1px 5px;


    grid-template-columns: repeat(5, 140px);
}




.box {
    min-width: 40px;
    display: flex;
    justify-content: center;
    align-items: flex-end;

    >* {
        margin-bottom: 7px;
    }
}

.index-box {
    font-size: .6rem;
    font-weight: bold;

    span {
        padding: 3px 6px;
        border-radius: 30px;
        background-color: $gray;
        color: $white;
    }
}

label span {
    font-size: .6rem;
}
</style>