<template>
    <div class="router-tree">
        <b>{{ name }}</b>
        <ul>
            <li
                v-for="([key, value], index) in childrenList"
                :key="index"
            >
                <div v-if="Array.isArray(value)">
                    <SettingInput
                        :ref="`input-${index}`"
                        :label="key"
                        :path="getPath(key)"

                        :value=value
                        :active="activeElementPath === getPath(key)"
                        @apply="applyArraySettings(key, value)"
                        @click.native="() => settingsInputClicked(key, `input-${index}`)"
                    >
                    </SettingInput>
                </div>
                <router-tree
                    v-else-if="(typeof value === 'object')"
                    :ref="`tree-${index}`"
                    :name="key"
                    :children="value"
                    :path="getPath(key)"
                    :activeElementPath="activeElementPath"
                    @requestActive="requestActive"
                    @requestAdd="$emit('requestAdd', $event)"
                ></router-tree>
                <div v-else>
                    <SettingInput
                        :ref="`input-${index}`"
                        :path="getPath(key)"
                        :label="key"
                        :value=value
                        :active="activeElementPath === getPath(key)"
                        @apply="applySettings(key, value)"
                        @click.native="() => settingsInputClicked(key, `input-${index}`)"
                    >
                    </SettingInput>
                </div>
            </li>
            <li>
                <Button @click="$emit('requestAdd', path)">
                    +
                </Button>
            </li>

        </ul>
    </div>
</template>

<script>
import Query from "../../../database/query"
import RouterTree from "./RouterTree.vue";
import SettingInput from "../../forms/SettingsInput.vue"
import Sorter from "../../../utils/Sorter"
import Button from "../buttons/Button.vue";

export default {
    name: "RouterTree",
    components: {
        RouterTree,
        SettingInput,
        Button
    },
    props: {
        name: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        children: {
            type: Object,
            required: true
        },
        activeElementPath: {
            validator: (value) => {
                return typeof value === 'string' || value === null
            }
        }

    },
    methods: {
        settingsInputClicked(key, refName) {
            this.$emit('requestActive', this.getPath(key), this.$refs[refName][0])
        },
        getPath(child) {
            return this.path + '/' + child
        },
        async applyArraySettings(child, value) {
            try {
                this.error = ""
                let val = `[${value}]`
                let arr = JSON.parse(val)
                this.applySettings(child, arr)
            }catch(e){
                console.error(e)
            }
            
        },
        async applySettings(child, value) {
            try {
                await Query.raw(`updateSetting ('${this.getPath(child)}', '${value}')`, {}, true)
                window.location.reload()
            } catch (e) {
                console.error(e)
            }
        },
        requestActive(path, element) {
            this.$emit('requestActive', path, element)
        },
        find(path) {
            for (let [key, element] of Object.entries(this.$refs)) {
                if (key.startsWith('tree-')) {
                    let match = element.find(path)
                    if (match) {
                        return match
                    }
                } else if (key.startsWith('input-')) {
                    if (element.getPath() === path) {
                        return element
                    }

                } else {
                    throw new Error('Invalid ref name')
                }
            }
            return null
        }
    },
    computed: {
        childrenList() {
            let childs = Object.entries(this.children)
            const arr = childs.sort(([a, _1], [b, _2]) => a.localeCompare(b))
            return arr
        }
    }
};
</script>

<style lang='scss' scoped>
ul {
    list-style-type: none;
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: $padding;
}
</style>