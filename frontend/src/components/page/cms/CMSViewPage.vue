<template>
    <div class="page">
        <section class="content-wrapper">
            <CMSView 
                :id="id"
                :group="group"
            />
</section>
    </div>
</template>

<script>
import CMSView from '../../cms/CMSView.vue';

export default {
    components: { CMSView },
    props: {
        group: {
            type: Number,
            required: true,
        },
        id: {
            type: Number,
            required: false,
            default: null,
        }
    },
};

</script>