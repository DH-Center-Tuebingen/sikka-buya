<template>
    <fieldset>
        <h3 v-if="title">
{{ title }}
</h3>

        <LabeledInputContainer class="box-row">
            <template #label>
                <Locale path="system.email" />
            </template>
            <input
                id="username"
                name="username"
                type="email"
                :value="email"
                required
                autocomplete="username"
                autofocus
                @input="emailChanged"
            >
        </LabeledInputContainer>

        <LabeledInputContainer class="box-row">
            <template #label>
                <Locale path="system.password" />
            </template>
            <input
                id="cpassword"
                type="password"
                name="current-password"
                :value="password"
                autocomplete="current-password"
                required
                @input="passwordChanged"
            >
            <p v-if="loginError">
{{ loginError }}
</p>
        </LabeledInputContainer>
    </fieldset>
</template>

<script>
import Locale from '../cms/Locale.vue';
import LabeledInputContainer from '../LabeledInputContainer.vue';
export default {
    name: 'UserForm',
    components: {
        LabeledInputContainer,
        Locale
    },
    props: {
        title: String,
        email: String,
        password: String,
        loginError: String,
        disabled: Boolean,
    },
    methods: {
        passwordChanged: function (event) {
            this.changed({ password: event.currentTarget.value });
        },
        emailChanged: function (event) {
            this.changed({ email: event.currentTarget.value });
        },
        changed: function (args) {
            const inputObject = Object.assign(
                {},
                {
                    email: this.email,
                    password: this.password,
                },
                args
            );

            this.$emit('input', inputObject);
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
fieldset {
    border: none;
    padding: 0;
    width: 100%;
}

input {
    width: 100%;
    box-sizing: border-box;
}

fieldset>*:not(:first-child, input, button) {
    display: block;
    margin-top: $padding;
}

button {
    margin-top: 3 * $padding;
}

h3 {
    user-select: none;
    margin-top: 0;
}
</style>
