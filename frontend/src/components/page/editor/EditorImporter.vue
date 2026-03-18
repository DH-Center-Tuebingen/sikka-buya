<template>
    <div class="editor-importer">
        <h2>Import</h2>
        <form
            method="post"
            enctype="multipart/form-data"
            @submit.prevent="(e) => importFile(e)"
        >
            <p>Don't leave this site while importing.</p>

            <input
                id="file"
                ref="fileInput"
                type="file"
                name="file"
                accept=".csv"
                :disabled="loading || imported"
                required
            >
            <AsyncButton
                :pending="loading"
                :disabled="imported"
                :colored="true"
            >
                Import
            </AsyncButton>
            <div
                v-if="imported"
                class="success-message"
            >
                <h2>Import Successful!</h2>
                <p><strong>{{ importedRows }} were added</strong></p>
                <p>Do you want to import another file?</p>

                <button @click="resetImport">
                    Yes
                </button>
            </div>

            <div class="import-destructor">
                Remove all records?
                <DynamicDeleteButton @delete="importDestructor" />
            </div>

            <ErrorMessage
                v-if="errors"
                :error="errors"
            />
        </form>
    </div>
</template>

<script>
import AxiosHelper from '@/utils/AxiosHelper';
import Query from '@/database/query';
import AsyncButton from '@/components/layout/buttons/AsyncButton.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import DynamicDeleteButton from '@/components/layout/DynamicDeleteButton.vue';

export default {
    name: 'EditorImporter',
    components: {
        AsyncButton,
        DynamicDeleteButton,
        ErrorMessage,
    },
    data: function () {
        return {
            loading: false,
            errors: [],
            imported: false,
            importedRows: 0,
        };
    },
    created: function () {
    },
    methods: {
        async importFile(event) {
            this.loading = true;
            this.errors = [];
            try {

                const response = await Query.rawWithFile(`mutation($file: Upload!){importResolver(file: $file)}`, {}, this.$refs.fileInput.files[0]);

                if (AxiosHelper.ok(response)) {
                    const responseData = response.data.data.importResolver;
                    if (responseData.success) {
                        this.imported = true;
                        this.importedRows = responseData.rows;
                    } else {
                        console.error(response);
                        this.errors = ["Unknown error during import!"];
                    }
                } else {
                    this.errors = AxiosHelper.getErrorMessage(response);
                }
            } catch (err) {
                this.errors = Array.isArray(err) ? err : [err.message || "An unknown error occurred during import!"];
            }
            this.loading = false;

        },
        async importDestructor() {
            this.loading = true;
            this.errors = [];
            try {
                const response = await Query.raw(`mutation{importDestructor}`);

                if (AxiosHelper.ok(response)) {
                    // No need to do anything, the import is reset
                } else {
                    this.errors = AxiosHelper.getErrorMessage(response);
                }
            } catch (err) {
                this.errors = Array.isArray(err) ? err : [err.message || "An unknown error occurred during import reset!"];
            }
            this.loading = false;
        },
        resetImport() {
            this.imported = false;
            this.errors = [];
            this.importedRows = 0;
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.success-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $padding;
    background-color: white;
    border-radius: $border-radius;
    padding: $big-box-padding;

    button {
        width: 100%;
    }
}

.import-destructor {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: salmon;
    padding: $big-box-padding;
    border-radius: $border-radius;
}
</style>