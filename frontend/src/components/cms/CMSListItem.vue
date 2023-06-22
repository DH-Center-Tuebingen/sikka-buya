<template>
    <div
        class="cms-list-item"
        :class="klasses"
    >
        <header>
            <div class="titles">
                <h3 v-if="isPresent('title')">{{ value.title }}</h3>
                <h4 v-if="isPresent('subtitle')">{{ value.subtitle }}</h4>
            </div>
            <div class="misc">
                <span class="date">
                    {{ time_mixin_formatDate(value.publishedTimestamp) || "-" }}
                </span>
                <ActionsDrawer
                    v-if="$store.getters.canEdit"
                    align="right"
                    :actions="[
                        { name: 'delete', label: $tc('general.delete') },
                        { name: 'edit', label: $tc('general.edit') },
                    ]"
                    @select="executeAction"
                />

            </div>


        </header>
        <div class="body">



            <div
                v-if="isPresent('body')"
                v-html="value.body"
            ></div>
        </div>
    </div>
</template>

<script>

// Components
import ActionsDrawer from "../interactive/ActionsDrawer.vue";
import Button from '../layout/buttons/Button.vue';
import Locale from "./Locale.vue";

// Mixins
import CMSMixin from "../mixins/cms-mixin"
import TimeMixin from '../mixins/time-mixin';

// Utils
import CMSConfig from "../../../cms.config";

export default {
    mixins: [TimeMixin, CMSMixin],
    components: {
        ActionsDrawer,
        Button,
        Locale
    },
    props: {
        showTime: { type: Boolean, default: true },
        value: { type: Object, required: true },
        group: { type: String, required: true },
        include: { type: Array, default: () => [] }
    },
    methods: {
        executeAction(action) {
            if (action === "delete") {
                this.remove()
            } else if (action === "edit") {
                this.edit()
            } else throw new Error("Unknown action: " + action)
        },
        isPresent(name) {
            const configInlcudes = CMSConfig?.[this.group]?.preview?.include || []
            const componentInclude = this.include || []
            const include = [...configInlcudes, ...componentInclude]

            if (include.length > 0) {
                return include.includes(name)
            } else {
                return this.value[name] && this.value[name] !== ""
            }
        },
        edit: function () {
            this.cms_mixin_edit({ id: this.value.id, group: this.group }, { include: this.include })
        },
        remove: async function () {
            const consent = confirm("Are you sure you want to delete this item?")
            if (consent) {
                await this.cms_mixin_delete(this.value.id)
                this.$emit("deleted")
            }
        }
    },
    computed: {
        klasses() {
            const publishedClass = this.cms_mixin_getPublishedState(this.value.publishedTimestamp)

            return {
                editable: this.$store.getters.canEdit,
                [publishedClass]: true
            }
        }
    }
};
</script>

<style lang='scss' scoped>
header {
    display: flex;
    align-items: flex-start;

    .titles {
        flex: 1;
        margin-bottom: .5em;
    }

    .misc {
        display: flex;
        align-items: center;
        gap: $padding;
    }
}

h3 {
    margin-top: .25em;
    margin-bottom: 0;
}

h4 {
    color: $gray;
    font-weight: normal;
    font-style: italic;
    margin: .25em 0;

}

// .actions-drawer {
//     padding: $padding;
// }

.cms-list-item {
    position: relative;

    &.scheduled,
    &.draft {
        .misc .date {


            &::before {
                // position: absolute;
                // top: 0;
                // left: 0;

                font-size: .75rem;
                font-weight: bold;

                padding: $padding;
                content: "";
                text-transform: uppercase;
            }
        }
    }


    &.scheduled {

        border-right: 5px solid $purple;

        .misc .date::before {
            color: $purple;
            content: "Scheduled";
        }
    }

    &.draft {
        border-right: 5px solid $yellow;

        .misc .date::before {
            color: $yellow;
            content: "Draft";
        }
    }
}

.date {
    font-size: $small-font;
    color: $light-gray;
}

.body {
    align-self: center;
}

.toolbox {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1em;
}
</style>