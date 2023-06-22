<template>
    <div class="list-view">
        <h2>
            <Locale :path="`cms.${this.group}`" />
        </h2>
        <Button
            v-if="$store.getters.canEdit"
            @click="() => cms_mixin_createAndVisit(this.group, { include: this.include })"
        >Neuer Eintrag</Button>
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
import CMSMixin from "../../mixins/cms-mixin"
import Locale from '../../cms/Locale.vue';


export default {
    components: { Button, CMSListItem, Locale },
    mixins: [CMSMixin],
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
.list {
    margin-bottom: $page-bottom-spacing;

    >* {
        margin-top: $padding;
    }
}
</style>