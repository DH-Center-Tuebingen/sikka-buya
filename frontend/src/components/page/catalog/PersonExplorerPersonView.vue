<template>
    <Collapsible
        :key="person.id"
        class="person-explorer-person-view"
        :class="{
            ['generation-gap']: spacingByHardCodedGenerations(orderMap[person.id]),
        }"
        :collapsed="!open"
        @toggled="toggledCollapsible"
    >
        <template slot="header">
            <div
                v-if="editmode"
                class="edit-toolbar"
            >
                <input
                    type="number"
                    class="editor-order-input"
                    :value="orderMap[person.id]"
                    @click.stop
                    @change="$emit('order-changed', $event, person.id)"
                >
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="formatName(person.name)" />
        </template>
        <LoadingSpinner v-if="loading" />
        <!-- Year List -->
        <section v-else>
            <PersonExplorerYearList
                class="year-area area"
                :list="sortedTypeTree"
                :person="person"
                :active="activeYears"
                @change="yearChanged"
            />
        </section>

        <!-- Mint List -->
        <section
            v-if="hasActiveYears"
            class="mint-section area"
        >
            <PersonExplorerMintList
                :year-object-array="yearObjectArray"
                :active-years="activeYears"
                @change="mintChanged"
            />
        </section>
        <!-- Type List -->
        <section
            v-if="hasActiveYears && hasActiveMints"
            class="type-section area"
        >
            <PersonExplorerTypeList
                :issuer-types="getActiveTypes(false)"
                :overlord-types="getActiveTypes(true)"
                :selected="activeType"
                @change="selectType"
            />
        </section>

        <!-- Type View -->
        <type-view
            v-if="activeType"
            :type="selectedType"
        />
    </collapsible>
</template>

<script>
import Collapsible from '../../layout/Collapsible.vue';
import LoadingSpinner from '../../misc/LoadingSpinner.vue';
import PersonExplorerMintList from './PersonExplorerMintList.vue';
import PersonExplorerYearList from './PersonExplorerYearList.vue';
import Sort from '../../../utils/Sorter';
import Type from '../../../utils/Type';
import PersonExplorerTypeList from './PersonExplorerTypeList.vue';
import TypeView from '../TypeView.vue';

export default {
    components: {
        Collapsible,
        LoadingSpinner,
        PersonExplorerMintList,
        PersonExplorerYearList,
        PersonExplorerTypeList,
        TypeView,
    },
    props: {
        initialSelection: Object,
        person: {
            required: true,
            type: Object,
        },
        orderMap: {
            required: true,
            type: Object,
        },
        editmode: Boolean,
    },
    data() {
        return {
            loading: false,
            open: false,
            types: {},
            typeTree: {},
            activeYears: {},
            activeType: null,
        };
    },
    computed: {
        selection() {
            return {
                open: this.open,
                types: this.types,
                typeTree: this.typeTree,
                activeYears: this.activeYears,
                activeType: this.activeType,
            };
        },
        selectedType() {
            return this.types[this.activeType];
        },
        availableMints() {
            return [];
        },
        yearObjectArray() {
            const yearObjects = [];
            Object.keys(this.activeYears).forEach((year) => {
                yearObjects.push(this.typeTree[year]);
            });
            return yearObjects.sort(Sort.stringPropAlphabetically('value'));
        },
        sortedTypeTree() {
            let typeTree = Object.values(this.typeTree);
            return typeTree.sort(Sort.stringPropAlphabetically('value'));
        },
        hasActiveMints() {
            for (let activeYearObj of Object.values(this.activeYears)) {
                if (
                    Object.keys(activeYearObj.activeOverlordsMints).length > 0 ||
                    Object.keys(activeYearObj.activeIssuerMints).length > 0
                )
                    return true;
            }
            return false;
        },
        hasActiveYears() {
            return Object.keys(this.activeYears).length > 0;
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        async init() {
            if (this.initialSelection) {
                if (this.initialSelection.open) {
                    this.open = true;
                    await this.getTypes();
                }

                for (let [key, val] of Object.entries(this.initialSelection)) {
                    this.$data[key] = val;
                }
            }
        },
        getSelection() {
            return {
                activeType: (this.open) ? this.activeType : [],
                activeYears: (this.open) ? this.activeYears : [],
                open: this.open,
            };
        },
        toggledCollapsible() {
            if (this.open) {
                this.resetSelection();
            } else {
                this.getTypes();
            }
            this.open = !this.open;
            this.selectionChanged();
        },
        resetSelection() {
            this.activeYears = {};
            this.activeType = null;
        },
        selectType(id) {
            this.activeType = this.activeType === id ? null : id;
            this.selectionChanged();
        },
        selectionChanged() {
            this.$emit('selection-changed', this.person.id, this.getSelection());
        },
        isTypeActive(id) {
            return this.activeType === id;
        },
        spacingByHardCodedGenerations(num) {
            let generationalSpacings = [27, 23, 20, 14, 11, 9, 5, 3];
            return generationalSpacings.indexOf(num) != -1;
        },
        formatName(name) {
            return name.replace(/^(.*)(b\..*?|banū.*?)(?=\(|$)/g, '$1 <i>$2</i>');
        },
        yearChanged(year) {
            if (this.activeYears[year]) {
                if (this.types?.[this.activeType]?.yearOfMint === year)
                    this.activeType = null;
                delete this.activeYears[year];
            } else
                this.activeYears[year] = {
                    activeIssuerMints: {},
                    activeOverlordsMints: {},
                };
            this.activeYears = Object.assign({}, this.activeYears);
            this.selectionChanged();
        },
        mintChanged(year, mintId, isOverlord = false) {
            const toggleMintObject = (obj) => {
                if (obj[mintId]) {
                    const typeLeaves = this.getTypesFromTree(year, mintId, isOverlord);
                    if (
                        typeLeaves.findIndex((type) => type.id === this.activeType) !== -1
                    )
                        this.activeType = null;
                    delete obj[mintId];
                } else obj[mintId] = true;
            };

            if (isOverlord) {
                toggleMintObject(this.activeYears[year].activeOverlordsMints);
            } else {
                toggleMintObject(this.activeYears[year].activeIssuerMints);
            }

            this.activeYears = Object.assign({}, this.activeYears);
            this.selectionChanged();
        },

        getTypes: async function () {
            if (!this.loading) {
                this.loading = true;
                try {
                    const result = await Type.filteredQuery({
                        pagination: {
                            page: 0,
                            count: 100000,
                        },
                        filters: {
                            ruler: [this.person.id],
                            excludeFromTypeCatalogue: false,
                        },
                        typeBody: `id projectId treadwellId mint {name id location } mintAsOnCoin material {name id} nominal {name id}
yearOfMint donativ procedure issuers {id name shortName} overlords {id name shortName} otherPersons {id role {name id} name shortName}
caliph {id name shortName}
avers {fieldText innerInscript intermediateInscript outerInscript misc}
reverse {fieldText innerInscript intermediateInscript outerInscript misc} 
cursiveScript coinMarks {name id}
literature pieces  specials yearUncertain mintUncertain excludeFromMapApp
completed
`,
                    });

                    const types = result.types;

                    let typeTree = {};
                    types.forEach((type) => {
                        this.types[type.id] = type;

                        const year =
                            type.yearOfMint === '' ? ' ohne Jahresangabe' : type.yearOfMint;

                        if (!typeTree[year]) {
                            typeTree[year] = {
                                value: year,
                                active: false,
                                // children: {},
                                asIssuer: {},
                                asOverlord: {},
                            };
                        }

                        const isIssuer = Boolean(
                            type.issuers.find((issuer) => issuer.id === this.person.id)
                        );

                        let mint = type?.mint?.id
                            ? type.mint
                            : { id: 0, name: 'ohne Ortsangabe' };
                        const mintId = mint.id;

                        if (isIssuer) {
                            if (!typeTree[year].asIssuer[mintId]) {
                                typeTree[year].asIssuer[mintId] = {
                                    value: mint,
                                    active: false,
                                    children: [],
                                };
                            }
                            typeTree[year].asIssuer[mintId].children.push(type);
                        } else {
                            if (!typeTree[year].asOverlord[mintId]) {
                                typeTree[year].asOverlord[mintId] = {
                                    value: mint,
                                    active: false,
                                    children: [],
                                };
                            }
                            typeTree[year].asOverlord[mintId].children.push(type);
                        }
                    });

                    this.typeTree = typeTree;
                } catch (e) {
                    console.error(e);
                    this.person.error = e;
                } finally {
                    this.loading = false;
                }
            }
        },
        getTypesFromTree(year, mintId, isOverlord = false) {
            const rulerType = isOverlord ? 'asOverlord' : 'asIssuer';
            const types = this.typeTree[year]?.[rulerType]?.[mintId]?.children;
            return types ? types : [];
        },
        getActiveTypes(isOverlord = 'false') {
            const types = {};
            Object.entries(this.activeYears).forEach(([year, yearObj]) => {
                const mintProperty = isOverlord
                    ? 'activeOverlordsMints'
                    : 'activeIssuerMints';
                const obj = yearObj?.[mintProperty];

                Object.keys(obj).forEach((mintId) => {
                    const rulerProperty = isOverlord ? 'asOverlord' : 'asIssuer';
                    this.typeTree[year][rulerProperty][mintId].children.forEach(
                        (type) => {
                            types[type.id] = type;
                        }
                    );
                });
            });
            return Object.values(types);
        },
    },
};
</script>

<style lang="scss">
.person-explorer-person-view {

    button,
    .button {
        padding: math.div($padding, 2) $padding;
    }

    .active {
        color: $white;
        background-color: $primary-color;

        &:hover {
            color: $white;
            background-color: color.adjust($color: $primary-color, $lightness: -10%);
        }
    }

    &.collapsible.generation-gap {
        margin-bottom: 2 * $padding;
    }
}
</style>

<style
    lang="scss"
    scoped
>
.person-explorer-person-view section {
    margin-bottom: $padding * 2;
}

.editor-order-input {
    width: 65px;
    font-size: $small-font;
    padding: $small-padding $small-padding * 2;
    margin-right: $padding;
    text-align: right;
}
</style>