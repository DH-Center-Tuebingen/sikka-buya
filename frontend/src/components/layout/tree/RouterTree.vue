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
                    :name="key"
                    :children="value"
                    :path="getPath(key)"
                ></router-tree>
                <div v-else>
                    <SettingInput
                        :label="key"
                        :value=value
                        @apply="applySettings(key, value)"
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
        }
    },
    methods: {
        getPath(child) {
            return this.path + '/' + child
        },
        input(e) {
            console.log(e)
        },
        applySettings(child, value) {
            console.log(this.getPath(child), value)
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