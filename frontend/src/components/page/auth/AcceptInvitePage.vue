<template>
  <section class="center-box">
    <Box>
      <template #header>
        <h2>
          <Locale path="system.signup_title" />
        </h2>
      </template>
      <form
        action=""
        @submit.prevent="submit"
      >
<label for="">
          <Locale path="system.email" />
        </label>
        <input
          id="email"
          type="text"
          :value="email"
          readonly
        >
        <label for="password">
          <Locale path="system.password" />
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="new-password"
        >
        <error-message :error="error" />
      </form>

      <template #footer>
        <segmented-row>
          <template #right>
            <AsyncButton
              class="button big-button signup-button"
              :pending="disabled"
              @click="submit"
            >
              <Locale path="system.signup" />
            </AsyncButton>
          </template>
        </segmented-row>
      </template>
    </Box>
  </section>
</template>

<script>
import Query from '../../../database/query';
import Locale from '../../cms/Locale.vue';
import ErrorMessage from '../../ErrorMessage.vue';
import Box from '../../layout/Box.vue';
import SegmentedRow from '../../layout/SegmentedRow.vue';
import AsyncButton from '../../layout/buttons/AsyncButton.vue';
export default {
  name: 'AcceptInvitePage',
  components: { Box, ErrorMessage, SegmentedRow, Locale, AsyncButton },
  data: function () {
    return {
      password: '',
      error: '',
      disabled: false,
    };
  },
  computed: {
    email: function () {
      return this.$route.params.mail;
    },
  },
  methods: {
    submit: function () {
      this.disabled = true;
      Query.raw(
        `mutation AcceptInvite($email:String, $password:String) {
            acceptInvite(email:$email, password:$password)
            }`,
        {
          email: this.email,
          password: this.password,
        }
      )
        .then((result) => {
          this.error = '';
          this.$router.push({ name: 'Login' });
        })
        .catch((err) => {
          this.error = err;
        })
        .finally(() => {
          this.disabled = false;
        });
      return false
    },
  },
};
</script>

<style lang="scss" scoped>
button {
  color: $white;
  font-weight: bold;
  background-color: $primary-color;

  &[disabled] {
    background-color: gray;
  }
}

.box {
  align-items: stretch;
  max-width: 100%;
  background-color: $white;
  @include box-padding($big-padding);
}

form {
  //   width: 230px;
  //   display: flex;
  flex-direction: column;

  input {
    width: 100%;
  }

  >* {
    display: block;
    margin-top: $padding;
  }
}
</style>