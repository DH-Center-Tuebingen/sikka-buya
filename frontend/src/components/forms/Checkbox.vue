<template>
    <div
        :id="id"
        class="checkbox"
    >
        <input
            :id="'checkbox-' + id"
            type="checkbox"
            :name="id"
            :checked="value"
            @input="input"
        >

        <span class="label">
            <slot name="label" />
            {{ label }} (?)
        </span>
        <label
            v-if="label"
            :for="'checkbox-' + id"
        >
            <div class="check">
                <CheckboxMarked v-if="value" />
                <CheckboxBlankOutline v-else />
            </div>
        </label>
    </div>
</template>

<script>
import CheckboxBlankOutline from 'vue-material-design-icons/CheckboxBlankOutline';
import CheckboxMarked from 'vue-material-design-icons/CheckboxMarked';

export default {
    name: 'Checkbox',
    components: {
        CheckboxMarked,
        CheckboxBlankOutline,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        value: {
            type: Boolean,
        },
        label: { type: String, default: ' ' },
    },
    methods: {
        input: function (event) {
            const checked = event.target.checked;
            this.$emit('input', checked);
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
// label {
//   display: inline;
// }

label,
#check {
    display: inline-block;
}

input {
    display: none;
}
</style>
