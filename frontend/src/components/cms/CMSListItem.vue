<template>
    <div
        class="cms-list-item"
        :class="klasses"
    >

        <header v-if="$store.getters.loggedIn">

            <CMSPublicationStatus :pageTimestamp="parseInt(value.publishedTimestamp)" />
            <span class="date">
                {{ time_mixin_formatDate(value.publishedTimestamp) || "-" }}
            </span>
            <div
                style="position: relative;"
                @mouseenter="() => this.showInfo = true"
                @mouseleave="() => this.showInfo = false"
            >
                <Icon
                    type="mdi"
                    :path="icons.info"
                    :size="16"
                />
                <tooltip v-if="showInfo">
                    <table>
                        <tr>
                            <td>
                                <Locale path="time.created" />
                            </td>
                            <td>{{ new Date(value.createdTimestamp).toLocaleDateString("de-DE") }} {{ new
                                Date(value.createdTimestamp).toLocaleTimeString("de-DE") }}</td>
                        </tr>
                        <tr>
                            <td>
                                <Locale path="time.last_modified" />
                            </td>
                            <td>{{ new Date(value.lastModifiedTimestamp).toLocaleDateString("de-DE") }} {{ new
                                Date(value.lastModifiedTimestamp).toLocaleTimeString("de-DE") }}</td>
                        </tr>
                        <tr>
                            <td>
                                <Locale path="time.published" />
                            </td>
                            <td>{{ new Date(value.publishedTimestamp).toLocaleDateString("de-DE") }} {{ new
                                Date(value.publishedTimestamp).toLocaleTimeString("de-DE") }}</td>
                        </tr>

                    </table>
                </tooltip>
            </div>
            <ActionsDrawer
                v-if="$store.getters.editor"
                align="right"
                :actions="[
                    { name: 'delete', label: $tc('general.delete') },
                    { name: 'edit', label: $tc('general.edit') },
                ]"
                @select="executeAction"
            />




        </header>
        <article>
            <div class="titles">
                <h3 v-if="isPresent('title')">{{ value.title }}</h3>
                <h4 v-if="isPresent('subtitle')">{{ value.subtitle }}</h4>
            </div>

            <div class="body">
                <div
                    v-if="isPresent('body')"
                    v-html="value.body"
                ></div>
            </div>
        </article>
    </div>
</template>

<script>

// Components
import ActionsDrawer from "../interactive/ActionsDrawer.vue";
import Button from '../layout/buttons/Button.vue';
import CMSPublicationStatus from './CMSPublicationStatus.vue';
import Locale from "./Locale.vue";
import Tooltip from "../forms/Tooltip"

// Mixins
import CMSMixin from "../mixins/cms-mixin"
import TimeMixin from '../mixins/time-mixin';
import IconMixin from '../mixins/icon-mixin';

// Utils
import CMSConfig from "../../../cms.config";
import { mdiInformationOutline } from '@mdi/js';

export default {
    mixins: [TimeMixin, CMSMixin, IconMixin({ info: mdiInformationOutline })],
    components: {
        ActionsDrawer,
        Button,
        CMSPublicationStatus,
        Locale,
        Tooltip,
    },
    data() {
        return {
            showInfo: false
        }
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
                editable: this.$store.getters.editor,
                [publishedClass]: true
            }
        }
    }
};
</script>

<style lang='scss' scoped>
header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .25em 1em;
    border-bottom: 1px solid #efefef;

    .cms-publication-status {
        padding-left: 0;
    }

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

.cms-list-item {
    position: relative;
    background-color: white;
    border-radius: $border-radius;
}

article {
    padding: .5em 1em 1em 1em;
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

.cms-list-item.editable {
    padding-top: 0 !important;
}
</style>