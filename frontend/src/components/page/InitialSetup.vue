<template>
    <section class="center-box">
        <Box class="">
            <template #header>
                <h2>
                    <Locale path="system.setup" />
                </h2>
            </template>


            <div v-if="!databaseExists">
                <p class="error">
                    <Locale path="error.database_does_not_exist" />
                </p>
            </div>
            <div v-else>
                <p style="font-style: italic">
                    <Locale path="message.initial_setup_info" />
                </p>
                <form action.prevent>
                    <user-form
                        :email="email"
                        :password="password"
                        @input="formChanged"
                        @submit="submit"
                    />
                </form>
                <p
                    v-if="response"
                    class="success"
                >
{{ response }}
</p>
                <p
                    v-if="response"
                    class="error"
                >
{{ error }}
</p>

                <segmented-row>
                    <template #right>
                        <ButtonVue
                            id="submit-button"
                            class="colored big-button"
                            @click="submit"
                        >
                            <Locale path="form.submit" />
                        </ButtonVue>
                    </template>
                </segmented-row>
            </div>
        </Box>
    </section>
</template>

<script>
import Query from '../../database/query';
import UserForm from '../auth/UserForm';
import Locale from '../cms/Locale.vue';
import Box from '../layout/Box.vue';
import ButtonVue from '../layout/buttons/Button.vue';
import SegmentedRow from '../layout/SegmentedRow.vue';
export default {
    components: {
        UserForm,
        Box,
        ButtonVue,
        SegmentedRow,
        Locale,
    },
    data: function () {
        return {
            email: '',
            password: '',
            response: '',
            error: '',
            databaseExists: false,
        };
    },
    mounted: function () {
        Query.raw(
            `
      {
        databaseExists
      }
      `
        )
            .then((result) => {
                this.databaseExists = result.data.data.databaseExists;
            })
            .catch(console.error);
    },
    methods: {
        formChanged: function (obj) {
            Object.assign(this.$data, obj);
        },

        submit: function () {
            Query.raw(
                `
        mutation{
          setup(
            email: "${this.email}",
            password:"${this.password}"
          ){
            success
            message
            token
          }
        }
     `
            )
                .then(() => {
                    this.error = '';
                    this.response = 'Succesfully created superuser!';
                })
                .catch((err) => {
                    console.error(err);
                    this.response = '';
                    this.error = `Could not create superuser: ${err}.`;
                });
        },
    },
};
</script>

<style
    lang="scss"
    scoped
>
.box {
    max-width: 100%;
    width: 720px;
}

form {
    margin-bottom: $padding;
}
</style>