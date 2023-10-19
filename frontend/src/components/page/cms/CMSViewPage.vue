<template>
    <div class="page">
        <section class="content-wrapper">
            <CMSView 
                :group="group"
                :id="id"
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
        }
    },
};

</script>