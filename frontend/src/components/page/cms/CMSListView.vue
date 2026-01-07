<template>
    <div class="list-view">
        <header>
            <h2>
                <Locale :path="`cms.group.${group}`" />
            </h2>
            <ButtonVue
                v-if="$store.getters.writer"
                @click="() => cms_mixin_createAndVisit(group, { include: include })"
            >
                <Icon
                    type="mdi"
                    :path="icons.add"
                    :size="16"
                /> Neuer Eintrag
            </ButtonVue>
        </header>
        <div class="list">
            <CMSListItem
                v-for="page of pages"
                :key="page.id"
                :value="page"
                :group="group"
                :include="include"
                :show-time="showTime"
                @deleted="update"
            />
        </div>
    </div>
</template>

<script>
import ButtonVue from '../../layout/buttons/Button.vue';
import CMSListItem from '../../cms/CMSListItem.vue';
import Locale from '../../cms/Locale.vue';

import CMSMixin from "../../mixins/cms-mixin"
import IconMixin from "../../mixins/icon-mixin"

import { mdiPlus } from "@mdi/js"

export default {
    components: { ButtonVue, CMSListItem, Locale },
    mixins: [CMSMixin, IconMixin({ add: mdiPlus })],
    props: {
        showTime: {
            type: Boolean,
            default: true
        },
        include: {
            type: Array,
            default: () => []
        },
        group: {
            type: String,
            required: true,
        }
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

<style
    lang='scss'
    scoped
>
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
}
</style>