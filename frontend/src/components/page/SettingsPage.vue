<template>
    <div class="settings-page page">
        <section>
            <h1>Settings</h1>

            <button @click="updateConfig">Update</button>
            <!-- <div style="display: flex;">
                <input
                    type="text"
                    v-model="addPath"
                    placeholder="Pfad"
                    ref="addPath"

                >
                <input
                    type="text"
                    v-model="addValue"
                    placeholder="Wert"
                    ref="addValue"
                >
                <button @click="add">Add</button>
            </div> -->
            <!-- <Breadcrumbs /> -->
            <RouterTree
                ref="tree"
                path=""
                name=""
                :activeElementPath="activePath"
                :children="tree"
                @requestActive="activate"
                @requestAdd="requestAdd"
            />
        </section>

    </div>
</template>

<script>
import Query from '../../database/query';
import RouterTree from '../layout/tree/RouterTree.vue';
import Breadcrumbs from "../navigation/Breadcrumbs.vue"

import SettingsTemplate from "../../../settings.json";

export default {
    components: {
        Breadcrumbs,
        RouterTree
    }, data() {
        return {
            addPath: "",
            addValue: "",
            activePath: null,
            activeElement: null,
            tree: {}
        }
    },
    mounted() {
        this.load()
    },
    methods: {
        requestAdd(path) {
            this.addPath = path + "/"

        },
        reload() {
            window.location.reload()
        },
        async add() {
            if (this.addValue && this.addPath) {
                await Query.raw(`mutation UpdateSetting($path: String!, $value: String!) {updateSetting (path:$path, value:$value )}`, {
                    path: this.addPath,
                    value: this.addValue
                }, true)
                this.reload()

            }
        },
        async updateConfig() {
            await Query.raw(`mutation Generate($template: String!) { generateManagedConfigs(template: $template) }`, {
                template: JSON.stringify(SettingsTemplate)
            }, true)
            this.reload()
        },
        async load() {
            const result = await Query.raw(`{settings}`)
            try {
                const loaded = JSON.parse(result.data.data.settings)

                this.fillTemplateBranch(loaded, SettingsTemplate)


                this.tree = loaded
            } catch (e) {
                console.error(e)
            }
        },
        fillTemplateBranch(target, template) {
            for (let key in template) {
                if (typeof template[key] === "object") {
                    if (target[key]) {
                        this.fillTemplateBranch(target[key], template[key])
                    } else {
                        target[key] = template[key]
                    }
                } else {
                    if (!target[key]) {
                        target[key] = template[key]
                    }
                }
            }
        },
        activate(path, element) {
            if (this.activePath) {
                if (this.activePath !== path) {
                    if (this.activeElement.isDirty()) {
                        window.alert("You have unsaved changes!")
                    } else {
                        this.activePath = path
                        this.activeElement = element
                        this.setAddPath(this.activePath)
                    }
                }
            } else {
                this.activePath = path
                this.activeElement = element
                this.setAddPath(this.activePath)
            }
        },
        setAddPath(path) {
            const arr = path.split("/")
            arr.pop()
            this.addPath = arr.join("/") + "/"
        }
    }
};
</script>

<style lang='scss' scoped></style>