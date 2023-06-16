<template>
    <div class="page">
        <loading-spinner :size="200"/>
    </div>
</template>

<script>
    import LoadingSpinner from '@/components/misc/LoadingSpinner.vue';

    export default {
        components: {
            LoadingSpinner
        }
    };
</script>

<style lang='scss' scoped>
    .page {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>