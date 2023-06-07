<template>
    <div class="page content-wrapper">
        <header>
            <div class="header-row">
                <h1>
                    <Locale :path="`cms.${$route.name}`" />
                </h1>
                <FileUploadButton
                    @change="uploadFile"
                    :loading="uploading"
                    v-if="$store.getters.canEdit"
                >
                    <Locale path="general.add" />
                </FileUploadButton>
            </div>

            <p v-if="description">{{ description }}</p>
        </header>

        <ul class="unstyled">
            <li
                v-for="file of files"
                :key="file.name"
                :data-type="getType(file.name)"
            >

                <a
                    :href="file.url"
                    target="_blank"
                >
                    <span class="file-name">{{ getName(file.name) }}</span>
                    <span class="type-indicator">{{ getType(file.name) }}</span>
                </a>

                <ActionsDrawer
                    v-if="$store.getters.canEdit"
                    :actions="[{ name: 'delete', label: $tc('general.delete') }]"
                    @select="(action) => executeAction(action, file)"
                    align="right"
                />
            </li>
        </ul>

    </div>
</template>

<script>
import Locale from '@/components/cms/Locale.vue';
import Query from '../../database/query';
import { paramCase } from "change-case"
import Button from '../layout/buttons/Button.vue';
import FileUploadButton from '../layout/buttons/FileUploadButton.vue';
import LoadingSpinner from '../misc/LoadingSpinner.vue';
import ActionsDrawer from '../interactive/ActionsDrawer.vue';

export default {
    components: {
        Locale,
        Button,
        FileUploadButton,
        LoadingSpinner,
        ActionsDrawer
    },
    props: {
        description: String
    },
    data() {
        return {
            files: [],
            uploading: false
        }
    },
    mounted() {
        this.load()
    },
    methods: {
        createIdentity(name) {
            name = name.split(".").slice(0, -1).join(".")
            return ["cms", "files", paramCase(this.$route.name), name].join("[$]")
        },
        executeAction: async function (action, file) {
            console.log("ACTION", action)
            if (action === "delete") {
                let identity = this.createIdentity(file.name)
                console.log("DELETE", identity)
                await Query.raw(`mutation deleteFile($identity: String!) {
                    deleteFile(identity: $identity)
                }`, {
                    identity
                })
                document.location.reload(true)
            }
        },
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
            `, {}, true)

            this.files = query.data.data.files
        },
        uploadFile: async function (event) {
            if (!this.uploading) {
                this.uploading = true

                const file = event.target.files[0]
                const identity = this.createIdentity(file.name)
                try {
                    await Query.uploadFile(identity, file)
                    // Instead of manually setting uploading false we just reload to
                    // get the list update and then the uploading is set to false anyways.
                    // This makes it seem less glithcy, as the spinning stays until the page is reloaded.
                    document.location.reload(true)
                } catch (e) {
                    console.error(e)
                    this.uploading = false
                }

            }
        }
    }
};
</script>

<style lang='scss' scoped>
ul li {
    display: flex;
    align-items: center;
    padding: .5em 1em;
    background-color: white;
    border-radius: $border-radius;
    margin: .5em 0;
    gap: 1em;
}

a {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 3em;
    color: currentColor;

    &:hover {
        filter: brightness(.99);
    }
}

.type-indicator {
    padding: .5em 1em;
    color: $light-gray;
    text-transform: uppercase;
}

.file-name {
    flex: 1;
}

.right {
    display: flex;
    align-items: center;
    gap: 1em;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>