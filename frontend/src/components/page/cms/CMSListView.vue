<template>
    <div class="list-view">
        <header>
            <h2>
                <Locale :path="`cms.group.${this.group}`" />
            </h2>
            <Button
                v-if="$store.getters.writer"
                @click="() => cms_mixin_createAndVisit(this.group, { include: this.include })"
            >
                <Icon
                    type="mdi"
                    :path="icons.add"
                    :size="16"
                /> Neuer Eintrag
            </Button>
        </header>
        <div class="list">
            <CMSListItem
                v-for="page of pages"
                :key="page.id"
                :value="page"
                :group="group"
                :include="include"
                :showTime="showTime"
                @deleted="update"
            />
        </div>
    </div>
</template>

<script>
import Button from '../../layout/buttons/Button.vue';
import CMSListItem from '../../cms/CMSListItem.vue';
import Locale from '../../cms/Locale.vue';

import CMSMixin from "../../mixins/cms-mixin"
import IconMixin from "../../mixins/icon-mixin"

import { mdiPlus } from "@mdi/js"



export default {
    components: { Button, CMSListItem, Locale },
    mixins: [CMSMixin, IconMixin({ add: mdiPlus })],
    props: {
        showTime: { type: Boolean, default: true },
        include: Array,
        group: String
    },
    data() {
        return {
            pages: Array
        }
    },
    created() {
        this.init()
    },
    methods: {
        init: async function () {
            await this.update()
        },
        update: async function () {
            this.pages = await this.cms_mixin_list(this.group)
        }
    }
};
</script>

<style lang='scss' scoped>
header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

button {
    gap: .5em;
}

.list {
    margin-bottom: $page-bottom-spacing;

    >* {
        margin-top: $padding;
    }
}</style>