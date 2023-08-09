<template>
    <div class="router-tree">
        <b>{{ path }}</b>
        <ul>
            <li
                v-for="([key, value], index) in childrenList"
                :key="index"
            >
                <router-tree
                    v-if="(typeof value === 'object')"
                    :children="value"
                    :path="getPath(key)"
                ></router-tree>
                <div v-else>
                    <SettingInput
                        :label="key"
                        :value=value
                    >

                    </SettingInput>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>

import RouterTree from "./RouterTree.vue";
import SettingInput from "../../forms/SettingsInput.vue"

export default {
    name: "RouterTree",
    components: {
        RouterTree,
        SettingInput,
    },
    props: {
        path: {
            type: String,
            required: true
        },
        children: {
            type: Object,
            required: true
        }
    },
    methods: {
        getPath(child) {
            return this.path + '/' + child
        },
        input(e) {
            console.log(e)
        }
    },
    computed: {
        childrenList() {
            return Object.entries(this.children)
        }
    }
};
</script>

<style lang='scss' scoped></style>