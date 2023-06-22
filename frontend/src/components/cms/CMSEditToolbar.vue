<template>
    <div class="cms-edit-toolbar">
        <div class="toolbar-inner">
            <CMSStatusIndicator
                :dirty="dirty"
                :pending="saving"
            />
            <AsyncButton
                v-if="editmode"
                @click="save()"
                :loading="saving"
                :disabled="!canSave"
            >
                Speichern
            </AsyncButton>


        </div>
    </div>
</template>

<script>
export default {
    props: {
        saving: false,
        dirty: false
    },
    computed: {
        canSave() {
            return this.dirty && !this.saving
        }
    }
};
</script>

<style lang='scss' scoped></style>