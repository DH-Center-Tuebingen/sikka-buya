<template>
    <div
        class="cms-list-item"
        :class="{ editable: $store.getters.canEdit }"
    >
        <div
            class="toolbox"
            v-if="$store.getters.canEdit"
        >
            <Button @click="() => cms_edit({ id: value.id, group }, { include })">
                <Locale path="general.edit" />
            </Button>
            <Button @click="() => remove(value.id)">
                <Locale path="general.delete" />
            </Button>
        </div>
        <header v-if="showTime">
            <span v-if="$store.getters.canEdit">
                <Locale path="time.created_date" /> {{ timeMixinFormatDate(value.createdTimestamp) }}
            </span>
            <span>
                <Locale path="time.published_date" /> {{ timeMixinFormatDate(value.publishedTimestamp) || "-" }}
            </span>
        </header>
        <div class="body">
            <h3 v-if="isPresent('title')">{{ value.title }}</h3>
            <h4 v-if="isPresent('subtitle')">{{ value.subtitle }}</h4>
            <div
                v-if="isPresent('body')"
                v-html="value.body"
            ></div>
        </div>
    </div>
</template>

<script>
import CMSMixin from "../mixins/cms"
import TimeMixin from '../mixins/time';
import Button from '../layout/buttons/Button.vue';
import CMSConfig from "../../../cms.config";
import Locale from "./Locale.vue";
export default {
    mixins: [TimeMixin, CMSMixin],
    components: {
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
        remove: async function (id) {

            const consent = confirm("Are you sure you want to delete this item?")
            if (consent) {
                await this.cms_delete(id)
                this.$emit("deleted")
            }
        }
    }
};
</script>

<style lang='scss' scoped>
.cms-list-item.editable {
    //     background-color: white;
    //     border: 1px solid $light-gray;
    //     border-radius: $border-radius;
    //     padding: $padding math.div($padding, 2);
}

header {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    margin-bottom: 1em;
    font-weight: bold;
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