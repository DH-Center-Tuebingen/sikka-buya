<template>
    <div class="settings-page page">
        <section>
            <h1>Settings</h1>
            <!-- <Breadcrumbs /> -->
            <RouterTree
                path=""
                name=""
                :children="tree"
            />
        </section>

    </div>
</template>

<script>
import RouterTree from '../layout/tree/RouterTree.vue';
import Breadcrumbs from "../navigation/Breadcrumbs.vue"
export default {
    components: {
        Breadcrumbs,
        RouterTree
    }, data() {
        return {
            tree: {
                project_settings: {
                    map: {
                        active: false,
                        startYear: 372
                    },
                    catalog: {
                        size: 5,
                        heading: "big"
                    }
                }
            }
        }
    }
};
</script>

<style lang='scss' scoped></style>