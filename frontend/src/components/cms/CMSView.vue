<template>
    <div class="cms-view">
        <header v-if="$store.getters.isEditableByWriter">
            <button
                v-if="pageMissing"
                @click="cms_mixin_createAndVisit(group)"
            >
                <locale :path="createText ? createText : 'cms.create_page'" />
            </button>
            <button
                v-else
                @click="cms_mixin_edit({
                    id: page.id,
                    group
                }, { include })"
            >
                <locale :path="editText ? editText : 'cms.edit_page'" />
            </button>
        </header>

        <Info
            :always-show="true"
            type="warning"
            v-if="!exists"
            style="margin-top: 1rem;"
        >
            <locale :path="'cms.message.page_not_found'" />
        </Info>
        <div v-else>
            <component
                :is="headingTag"
                class="cms-title"
                v-if="isPresent('title')"
            >{{ page.title }}</component>
            <p
                class="cms-subtitle"
                v-if="isPresent('subtitle')"
            >{{ page.subtitle }}</p>

            <p
                v-if="isPresent('body')"
                class="cms-body"
                v-html="page.body"
            ></p>
        </div>
    </div>
</template>

<script>
import Button from '../layout/buttons/Button.vue';
import CMSPage from '../../models/CMSPage';
import CMSMixin from '../mixins/cms-mixin';
import Locale from './Locale.vue';
import Info from '../forms/Info.vue';

export default {
    components: { Button, Info, Locale },
    mixins: [CMSMixin],
    mounted() {
        this.init();
    },
    data() {
        return {
            page: new CMSPage(),
            ready: false,
        };
    },
    props: {
        headingTag: {
            type: String,
            default: 'h2',
            validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(value)
        },
        id: {
            type: Number
        },
        group: {
            type: String,
            required: true,
        },
        include: { type: Array, default: () => [] },
        exclude: { type: Array, default: () => [] },
        createText: String,
        editText: String
    },
    methods: {
        async init() {
            try {
                const page = await this.cms_mixin_get({ id: this.id, group: this.group })
                this.ready = true
                this.page.assign(page)
            } catch (e) {
                console.error(e)
            }
        },
        isPresent(key) {
            const allowed = this.isIncluded(key) && !this.isExcluded(key)
            const filled = this.page[key] !== null && this.page[key] !== ''
            return allowed && filled
        },
        isIncluded(key) {
            return this.include.length > 0 ? this.include.includes(key) : true
        },
        isExcluded(key) {
            return this.exclude.length > 0 ? this.exclude.includes(key) : false
        }
    },
    computed: {
        pageMissing() {
            return (this.ready && this.page.id === null) && this.$store.getters.isEditableByWriter
        }
    }
};
</script>

<style lang='scss' scoped>
header {
    display: flex;
    justify-content: flex-end;
}

h1 {
    margin-top: 3rem;
    margin-bottom: 5rem;
}

.cms-view>*:first-child:not(h1) {
    margin-top: 0;
}
</style>