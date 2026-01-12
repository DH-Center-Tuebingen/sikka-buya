<template>
    <div
        class="base-layer-preview-button"
        :class="{ active: active }"
    >
        <div>
            <img
                :src="image"
                :alt="name"
                class="layer-image"
                draggable="false"
                stype="pointer-events: none;"
            >
        </div>

        <!-- <div class="layer-name">
            {{ name }}
        </div> -->
    </div>
</template>

<script>
export default {
    props: {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            required: false,
            default: false
        }
    }
};
</script>

<style
    lang='scss'
    scoped
>
.base-layer-preview-button {
    position: relative;
    box-sizing: border-box;
    overflow: hidden;

    padding: 5px;

    @include interactive();
    width: 128px;
    height: 128px;
    border-radius: $border-radius;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;

    }

    .layer-name {
        position: absolute;
        bottom: $border-radius;
        left: $border-radius;
    }

    &.active:before {
        border-color: $primary-color;
    }

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 4px solid transparent;
        box-sizing: border-box;


    }
}
</style>