<template>
  <div class="login-page">
    <section class="center-box">
      <login-form @login="toEditorPage" />
    </section>
  </div>
</template>


<script>
import LoginForm from '../../auth/LoginForm.vue';

export default {
  name: 'LoginPage',
  components: { LoginForm },
  methods: {
    toEditorPage: function () {
      this.$router.push({ name: 'Editor' });
    },
  },
};
</script>
