<template>
    <router-link
        class="locale-link"
        :to="{
            name: 'Locale',
            force: true,
            params: {
                lang,
                path
            }
        }"
    >
        <div
            @mouseenter="() => mouseover = true"
            @mouseleave="() => mouseover = false"
            @click.stop
        >
            <EarthIcon
                :size="10"
                :class="{ active }"
            />

            <Tooltip v-if="mouseover">
                {{ path }}
            </Tooltip>
        </div>
    </router-link>
</template>

<script>

import EarthIcon from "vue-material-design-icons/Earth"
import Tooltip from '../forms/Tooltip.vue';

export default {
    components: {
        EarthIcon,
        Tooltip
    },
    props: {
        lang: {
            required: true,
            type: String
        },
        path: {
            required: true,
            type: String
        },
    },
    data() {
        return {
            active: false,
            mouseover: false,
        }
    },
}
</script>