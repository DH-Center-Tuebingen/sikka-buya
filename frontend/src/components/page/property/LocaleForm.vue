<template>
    <div class="locale-form">
        <h1>Locale</h1>

        <div class="grid">
            <strong>{{ lang }}</strong>
            <input
                type="text"
                v-model="path"
            />

            <Locale path="general.singular" />
            <InputWithReset
                type="text"
                name="singular"
                v-model="singular"
                placeholder="singular"
                icon="revert"
                @reset="reset('singular')"
            />

            <Locale path="general.plural" />
            <InputWithReset
                type="text"
                name="plural"
                icon="revert"
                v-model="plural"
                @reset="reset('plural')"
            />

        </div>
        <Button
            @click="submit"
            :disabled="!prevent_navigation_mixin_isDirty"
        >Anwenden</Button>
    </div>
</template>

<script>
import Query from '../../../database/query';
import I18n from '../../../i18n/i18n';
import Locale from '../../cms/Locale.vue';
import InputWithReset from '../../forms/InputWithReset.vue';
import preventNavigationMixin from '../../mixins/prevent-navigation-mixin';

export default {
    components: {
        InputWithReset,
        Locale
    },
    mixins: [preventNavigationMixin],
    data() {
        return {
            path: '',
            initialSingular: '',
            singular: '',
            initialPlural: '',
            plural: '',
            submitting: false,
        };
    },
    mounted() {
        this.init();
        addEventListener('keydown', this.submitWithEnter);
    },
    beforeDestroy() {
        removeEventListener('keydown', this.submitWithEnter);
    },
    beforeRouteUpdate(to, from, next) {
        this.init(to);
        next();
    },
    watch: {
        path() {
            this.initValues();
        },
        singular() {
            if (this.singular === this.initialSingular) this.prevent_navigation_mixin_setClean()
            else this.prevent_navigation_mixin_setDirty()
        },
        plural() {
            if (this.plural === this.initialPlural) this.prevent_navigation_mixin_setClean()
            else this.prevent_navigation_mixin_setDirty()
        }
    },
    methods: {
        init(route = null) {
            if (!route) route = this.$route;
            this.path = route.params.path || '';
            if (this.path) {
                this.initValues();
            }
        },
        initValues() {
            let val = this.$t(this.path);
            let names = val.split('|').map((el) => el.trim());
            this.singular = names[0] || '';
            this.initialSingular = this.singular;
            this.plural = names[1] || '';
            this.initialPlural = this.plural;
        },
        reset(target) {
            let initial = `initial${target.charAt(0).toUpperCase() + target.slice(1)}`;
            console.log(initial, target)
            this.$data[target] = this.$data[initial]
        },
        submitWithEnter(e) {
            if (e.key === 'Enter') this.submit();
        },
        async submit(e) {
            if (!this.submitting) {
                this.submitting = true;
                try {
                    await Query.raw(
                        `mutation SetLangAttribute($path: String!, $lang:String!, $singular: String!, $plural: String) {
                setLang(path: $path, lang: $lang, singular: $singular, plural: $plural)
            }`,
                        {
                            path: this.path,
                            lang: this.lang,
                            singular: this.singular === '' ? null : this.singular,
                            plural: this.plural === '' ? null : this.plural,
                        }
                    );

                    await I18n.reload(this.$root);
                    this.initValues();
                    this.prevent_navigation_mixin_setClean();
                    this.$router.go(-1);
                } catch (e) {
                    this.$store.commit('printError', e);
                }
                this.submitting = false;
            } else {
                this.$store.comit('printError', this.$tc('error.already_submitted'));
            }

            return false;
        },
    },
    computed: {
        lang() {
            return this.$route.params.lang;
        }
    },
};
</script>

<style lang="scss">
.locale-form {
    input {
        flex: 1;
    }
}
</style>

<style lang='scss' scoped>
.locale-form {
    gap: $padding;
}

.grid {
    display: grid;
    grid-template-columns: min-content 1fr;
    margin-bottom: $padding;
    gap: $padding;
    align-items: center;
}

button {
    margin-left: auto;
    width: 256px;
    max-width: 100%;
}
</style>