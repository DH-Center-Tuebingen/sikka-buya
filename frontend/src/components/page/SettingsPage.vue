<template>
    <div class="settings-page page">
        <section>
            <h1>Settings</h1>

            <div style="display: flex;">
                <input
                    type="text"
                    v-model="addPath"
                    placeholder="Pfad"
                >
                <input
                    type="text"
                    v-model="addValue"
                    placeholder="Wert"
                >
                <button @click="add">Add</button>
            </div>
            <!-- <Breadcrumbs /> -->
            <RouterTree
                ref="tree"
                path=""
                name=""
                :activeElementPath="activePath"
                :children="tree"
                @requestActive="activate"
            />
        </section>

    </div>
</template>

<script>
import Query from '../../database/query';
import RouterTree from '../layout/tree/RouterTree.vue';
import Breadcrumbs from "../navigation/Breadcrumbs.vue"
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
        reload() {
            window.location.reload(true)
        },
        async add() {
            if (this.addValue && this.addPath) {
                console.log("add")
                await Query.raw(`mutation UpdateSetting($path: String!, $value: String!) {updateSetting (path:$path, value:$value )}`, {
                    path: this.addPath,
                    value: this.addValue
                }, true)
                console.log("RELOAD")
                this.reload()

            }
        },
        async load() {
            const result = await Query.raw(`{settings}`)
            try {
                const json = JSON.parse(result.data.data.settings)
                this.tree = json
            } catch (e) {
                console.error(e)
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
            this.addPath = arr.join("/")
        }
    }
};
</script>

<style lang='scss' scoped></style>