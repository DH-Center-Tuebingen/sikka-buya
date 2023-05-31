<template>
    <div class="page content-wrapper">
        <header>
            <h1>
                <Locale :path="`cms.${$route.name}`" />
            </h1>

            <p v-if="description">{{ description }}</p>
        </header>

        <ul class="unstyled">
            <li
                v-for="file of files"
                :key="file.name"
                :data-type="{ [getType(file.name)]: true }"
            >

                <a :href="file.url">
                    <span class="file-name">{{ getName(file.name) }}</span>
                    <span class="type-indicator">{{ getType(file.name) }}</span>

                </a>
            </li>
        </ul>

    </div>
</template>

<script>
import Locale from '@/components/cms/Locale.vue';
import Query from '../../database/query';
import { paramCase } from "change-case"

export default {
    components: {
        Locale
    },
    props: {
        description: String
    },
    data() {
        return {
            files: []
        }
    },
    mounted() {
        this.load()
    },
    methods: {
        getType(filename) {
            const filetype = filename.split(".").pop()
            return filetype || 'unknown'
        },
        getName(filename) {
            return filename.split(".")[0].replace(/_/g, " ")
        },
        load: async function () {
            console.log(paramCase(this.$route.name))
            const query = await Query.raw(` {
                files(group:"${paramCase(this.$route.name)}") {
                        name
                        url
                    }
                }
            `)

            this.files = query.data.data.files
        }
    }
};
</script>

<style lang='scss' scoped>
a {
    display: flex;
    align-items: center;
    gap: 3em;
    padding: .5em 1em;
    background-color: white;
    border-radius: $border-radius;
    margin: .5em 0;

    &:hover {
        filter: brightness(.99);
    }
}

.type-indicator {
    padding: .5em 1em;
    color: white;
    background-color: $light-gray;
    text-transform: uppercase;
    border-radius: $border-radius;
}

.file-name {
    flex: 1;
}
</style>