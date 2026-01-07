<template>
  <Box
    class="login-form"
    title="Login"
  >
    <form
      ref="form"
      @keydown="enter"
    >
      <user-form
        :email="email"
        :password="password"
        :disabled="buttonDisabled"
        @input="inputChanged"
      />
    </form>
    <ErrorMessage
      v-if="loginError"
      :error="loginError"
    />


    <template #footer>
      <segmented-row>
        <template #right>
          <div>
            <async-button
              id="submit-button"
              ref="loginBtn"
              class="colored big-button"
              :pending="buttonDisabled"
              @click="buttonLogin"
            >
              Anmelden
            </async-button>
          </div>
        </template>
      </segmented-row>
    </template>
  </Box>
</template>

<script>
import Box from '../layout/Box.vue';
import UserForm from '../auth/UserForm';
import AsyncButton from '../layout/buttons/AsyncButton.vue';
import ErrorMessage from '../ErrorMessage.vue';
import Async from '../../utils/Async.mjs';
import SegmentedRow from '../layout/SegmentedRow.vue';

import AuthMixin from '../mixins/auth';

export default {
  name: 'LoginForm',
  components: { Box, UserForm, AsyncButton, ErrorMessage, SegmentedRow },
  mixins: [AuthMixin],
  data: function () {
    return {
      email: '',
      password: '',
      loginError: '',
      buttonDisabled: false,
    };
  },
  methods: {
    enter(evt) {
      if (evt.key === 'Enter') {
        this.$refs['loginBtn'].$el.click();
      }
    },

    inputChanged({ email, password } = {}) {
      Object.assign(this.$data, {
        email: email,
        password,
      });
    },
    buttonLogin: function () {
      if (this.$refs.form.checkValidity()) {
        this.loginError = '';
        this.buttonDisabled = true;
        const startTime = Date.now();
        const minSecondsToWait = 1.5;
        this.login(this.email, this.password)
          .then(async ({ message, success }) => {
            /**
             * It's weird and looks junky, when the button is resolved too
             * quickly. So we introduce an artifical delay to improve the UX.
             */
            const timeLeft = minSecondsToWait * 1000 - (Date.now() - startTime);
            await Async.sleep(timeLeft);

            if (!success) this.loginError = message;
          })
          .catch((err) => {
            console.error('ERROR: ', err);
            this.loginError = err;
          })
          .finally(() => {
            this.buttonDisabled = false;
          });
      } else {
        this.$refs.form.reportValidity();
      }
    },
  },
};
</script>

<style lang="scss" scoped>.buttons {
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
}</style>
