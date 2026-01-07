<template>
    <div class="fix-diff content">
        <h1>Vergleiche letzte Bereinigung</h1>

        <p
            v-if="error != ''"
            class="error"
        >
            {{ error }}
        </p>

        <p v-if="data">
            Letzte Durchführung: {{ data.lastModified }}
        </p>

        <div
            v-for="type in data.items"
            :key="'type-' + type.id"
            class="type"
        >
            <header>
                <h2>{{ type.name }}</h2>
                <ButtonVue @click="edit(type)">
                    <PencilIcon /> <span>Edit</span>
                </ButtonVue>
            </header>
            <div
                v-for="[name, diffObj] of Object.entries(type.fields)"
                :key="'type-' + type.id + '-property-' + name"
                class="property"
            >
                <h4>{{ name }}</h4>
                <div class="compare">
                    <div class="col old">
                        <label>Vorher</label>
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <div v-html="diffObj.old" />
                    </div>
                    <div class="col new">
                        <label>Nachher</label>
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <div v-html="diffObj.new" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Query from '../../database/query';
import ButtonVue from '../layout/buttons/Button.vue';
import PencilIcon from 'vue-material-design-icons/Pencil.vue';

export default {
    name: 'FixDiff',
    components: { ButtonVue, PencilIcon },
    data: function () {
        return {
            error: '',
            data: {},
        };
    },
    mounted: async function () {
        try {
            const results = await Query.raw('query { fixDiff }');
            this.data = JSON.parse(results.data.data.fixDiff);
        } catch (e) {
            console.error(e);
        }
    },
    methods: {
        edit(type) {
            let route = this.$router.resolve({
                name: 'EditType',
                params: { id: type.id },
            });
            window.open(route.href, '_blank');
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
.fix-diff header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.compare {
    display: grid;
    gap: 3px;
    grid-template-columns: repeat(2, 1fr);
}

label {
    position: absolute;
    top: 0px;
    left: 0px;

    color: rgb(199, 199, 199);
    text-transform: uppercase;
    background-color: rgb(163, 163, 163);
    padding: 5px 10px;
    border-bottom-right-radius: 10px;
}

.col {
    position: relative;

    padding: 50px;
    background-color: rgb(199, 199, 199);
    border-radius: 5px;
}
</style>