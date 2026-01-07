<template>
    <div
        class="grid"
        :style="style"
    >
        <div
            v-for="col of columns"
            :key="col"
            class="column"
        >
            <slot
                :name="col"
            />
        </div>
</div>
</template>

<script>
export default {
    props: {
        columns: {
            type: Number,
            required: true,
        }
    },
    computed: {
        style() {
            return {
                gridTemplateColumns: `repeat(${this.columns}, 1fr)`,
            };
        }
    }
};
</script>

<style lang='scss' scoped>

.column {
    display: flex;
      align-items: stretch;
      gap: $small-padding;
      color: $white;


      &:last-child {
      margin-left: auto;
    }
}
</style>