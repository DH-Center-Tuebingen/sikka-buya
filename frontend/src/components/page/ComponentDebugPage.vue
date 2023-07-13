<template>
    <div class="component-debug-page">
        <h1>Component Debug Page</h1>
        <main>
            <LocationInput
                :interactive="true"
                :type="type"
                :allowRadius="true"
                :radius="radius"
                :coordinates="coordinates"
                @update="updateInput"
                @updateRadius="updateRadius"
            />
        </main>
    </div>
</template>

<script>
import LocationInput from '../forms/LocationInput.vue';
export default {
    components: { LocationInput },
    data() {
        return {
            type: 'circle',
            coordinates: [0, 0],
            radius: 100
        }
    },
    methods: {
        updateInput({ type, coordinates }) {
            this.type = type;
            this.coordinates = coordinates;
        },
        updateRadius(radius) {
            this.radius = radius;
        }
    }
};
</script>

<style lang='scss' scoped></style>