<template>
  <div class="editor">
    <div class="content-wrapper">
      <router-view />
    </div>
  </div>
</template>

<script>
import Auth from '../../../utils/Auth';
export default {
  name: 'EditorPage',
  data: function () {
    return {
      user: {
        email: 'Unknown',
        id: 0,
      },
    };
  },
  created: function () {
    let user = Auth.loadUser();
    if (user) {
      this.$data.user = user;
    }
  },
  methods: {
    logout: function () {
      Auth.logout();
      this.$router.push('/');
    },
  },
};
</script>

<style lang="scss" scoped>
h3 {
  color: $primary-color;
  font-weight: 'black';
  text-transform: uppercase;
}

header {
  > .content-wrapper {
    flex: 1;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.user {
  display: flex;
  align-items: center;

  > * {
    margin-left: $padding;
  }
}
</style>