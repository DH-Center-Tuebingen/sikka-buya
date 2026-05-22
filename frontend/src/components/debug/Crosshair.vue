<template>
    <div
        class="crosshair"
        :style="dotStyle"
    >
        <span>{{ text }}</span>
    </div>
</template>

<script>
export default {
    props: {
        center: {
            required: true,
            type: Object,
            validator: (val) => {
                return val.hasOwnProperty('lat') && val.hasOwnProperty('lng');
            }
        },
        size: {
            type: Number,
            default: 10
        },
        color: {
            type: String,
            default: 'red'
        }
    },
    computed: {
        dotStyle() {
            return {
                height: this.size + 'px',
                width: this.size + 'px',
                borderRadius: parseInt(this.size / 2) + "px",
                backgroundColor: this.color,
                color: this.color
            }
        },
        text() {
            if(!this.center.lat || !this.center.lng) return "N/A";
            return this.center.lat.toFixed(4) + ", " + this.center.lng.toFixed(4);
        }
    }
};
</script>

<style lang='scss' scoped>
.crosshair {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    border-radius: 10px;
    $shadow-color: $white;
    box-shadow: -1px -1px 0 $shadow-color, 1px -1px 0 $shadow-color, -1px 1px 0 $shadow-color,
        1px 1px 0 $shadow-color;

    span {
        color: currentColor;
        position: absolute;
        left: 15px;
        top: 15px;
        text-shadow: -1px -1px 0 $shadow-color, 1px -1px 0 $shadow-color, -1px 1px 0 $shadow-color,
            1px 1px 0 $shadow-color;
    }
}
</style>