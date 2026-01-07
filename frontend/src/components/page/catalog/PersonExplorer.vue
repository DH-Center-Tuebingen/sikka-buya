<template>
    <div class="person-explorer">
        <editor-toolbar>
            <ButtonVue
                v-if="$store.state.user != null"
                :class="{ active: editmode }"
                @click="toggleEditMode()"
            >
Reihenfolge bearbeiten
</ButtonVue>
        </editor-toolbar>
        <div class="list">
            <PersonExplorerPersonView
                v-for="person of persons"
                :key="person.id"
                :initial-selection="getSelection(person)"
                :person="person"
                :order-map="orderMap"
                :editmode="editmode"
                @selection-changed="selectionChanged"
                @order-changed="orderChanged"
            />
        </div>
    </div>
</template>

<script>
import ButtonVue from '@/components/layout/buttons/Button.vue';
import EditorToolbar from '../editor/EditorToolbar.vue';
import PersonExplorerPersonView from './PersonExplorerPersonView.vue';
import Query from '@/database/query';

const selectionStorage = 'sikka-buya-person-explorer';

export default {
    components: {
        EditorToolbar,
        ButtonVue,
        PersonExplorerPersonView,
    },
    data: function () {
        return {
            selection: {},
            searchText: '',
            personMap: {},
            map: {},
            orderMap: {},
            editmode: false,
        };
    },
    computed: {
        persons() {
            return Object.values(this.personMap).sort((a, b) => {
                let aPos = this.orderMap[a.id] ? this.orderMap[a.id] : 0;
                let bPos = this.orderMap[b.id] ? this.orderMap[b.id] : 0;
                if (aPos < bPos) return 1;
                else if (aPos > bPos) return -1;
                else return 0;
            });
        },
    },
    mounted() {
        this.selection = this.load();
        this.updateRulers();
    },
    methods: {
        load() {
            let data = {};
            try {
                let storageString = localStorage.getItem(selectionStorage);
                data = JSON.parse(storageString);
            } catch (e) {
                console.warn(
                    'Person Explorer data could not be loaded! This is normal on first startup.'
                );
            }

            return data || {};
        },
        selectionChanged(personId, selection) {
            this.selection[personId] = {
                activeType: selection.activeType,
                activeYears: selection.activeYears,
                open: selection.open,
            };
            try {
                localStorage.setItem(selectionStorage, JSON.stringify(this.selection));
            } catch (e) {
                console.error(
                    'Could not save person explorer data to local storage: ',
                    e
                );
            }
        },
        updateRulers() {
            Query.raw(
                `{
          person (dynasty: 1){
            id
              name
              role {name}
              dynasty{name}
          } 
          
            getPersonExplorerOrder{
              order
              person
            }

          }`
            )
                .then((result) => {
                    const order = result.data.data.getPersonExplorerOrder;
                    const orderMap = {};
                    order.forEach((item) => {
                        if (item.person != null) {
                            orderMap[item.person] = item.order;
                        }
                    });
                    this.orderMap = orderMap;

                    const persons = result.data.data.person;

                    this.personMap = {};
                    persons.forEach((person) => {
                        person.activeYears = {};
                        person.activeOverlords = {};
                        person.activeIssuers = {};
                        person.activeType = null;
                        person.loading = true;
                        person.orderNum = orderMap[person.id] || -1000;
                        this.personMap[person.id] = person;
                    });
                })
                .catch(console.error);
        },

        orderChanged(event, personId) {
            Query.raw(
                `mutation {
          changePersonExplorerOrder (person: ${personId}, position: ${event.target.value})
        }`
            )
                .then(() => {
                    this.updateRulers();
                })
                .catch(console.error);
        },
        toggleEditMode() {
            if (this.$store.state.user) {
                this.editmode = !this.editmode;
            }
        },
        getSelection(person) {
            if (this.selection && this.selection[person.id])
                return this.selection[person.id];
            else return null;
        },
    },
};
</script>

<style lang="scss">

.person-explorer {
    h6 {
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .hint {
        display: block;
        margin: $padding auto;
        margin-top: 3 * $padding;
        text-align: center;
    }

    .collapsible {
        margin-bottom: 3px;

        border-radius: $border-radius;
        background-color: $white;

        &.open {
            >header {
                font-weight: bold;
            }
        }
    }

    .collapsible-header {
        color: $black;
        // font-weight: bold;
        padding: $padding;
    }

    .collapsible-content {
        min-height: 50px;
        padding: $padding;
    }

    .spinner {
        margin: auto;
        color: $primary-color;
    }

    .type-view {
        background-color: whitesmoke;
        padding: $padding;
        border-radius: $border-radius;
        padding-top: 3 * $padding;
    }

    .flex {
        display: flex;
        flex-wrap: wrap;
        margin: -3px;
        align-items: center;

        >* {
            margin: 3px;
        }
    }

    .active {
        color: $white;
        background-color: $primary-color;

        a {
            color: $white;
        }

        &:hover {
            color: $white;
            background-color: color.adjust($color: $primary-color, $lightness: -10%);
        }
    }
}
</style>
