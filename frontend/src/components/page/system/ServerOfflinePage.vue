<template>
    <div class="server-offline-page page">
        <Box>
            <template #header>
                <h2>Server Offline</h2>
            </template>
            <p>Der Server ist derzeit nicht erreichbar. Versuchen Sie es später erneut</p>
            <p>Currently the server appears to be offline. Please try again later</p>
            <ButtonVue @click="$emit('tryAgain')">
                Try again
            </ButtonVue>
        </Box>
    </div>
</template>

<script>
import Box from "@/components/layout/Box.vue"
import ButtonVue from "@/components/layout/buttons/Button.vue";

export default {
    components: {
        Box,
        ButtonVue,
    },
};
</script>

<style lang="scss">
.server-offline-page {
    .box {
        background-color: white;

    }
}
</style>

<style
    lang='scss'
    scoped
>
.page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
}
</style>