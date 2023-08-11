<template>
    <div class="router-tree">
        <b>{{ name }}</b>
        <ul>
            <li
                v-for="([key, value], index) in childrenList"
                :key="index"
            >
                <router-tree
                    v-if="(typeof value === 'object')"
                    :ref="`tree-${index}`"
                    :name="key"
                    :children="value"
                    :path="getPath(key)"
                    :activeElementPath="activeElementPath"
                    @requestActive="requestActive"
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
        </ul>
    </div>
</template>

<script>
import Query from "../../../database/query"
import RouterTree from "./RouterTree.vue";
import SettingInput from "../../forms/SettingsInput.vue"

export default {
    name: "RouterTree",
    components: {
        RouterTree,
        SettingInput,
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
        async applySettings(child, value) {
            try {
                await Query.raw(`updateSetting ('${this.getPath(child)}', '${value}')`, {}, true)
                location.reload(true)
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
            return Object.entries(this.children)
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