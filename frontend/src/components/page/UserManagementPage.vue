<template>
  <div class="page user-management-page">
    <back-header :to="{ name: 'Editor' }" />
    <h1>{{ $t('test') }}</h1>
    <section>
      <form submit.stop.prevent="">
        <h2>Add New User</h2>

        <span>Email</span>
        <input
          type="email"
          v-model="inviteEmail"
        />
        <input
          type="submit"
          value="Invite"
          @click.prevent="inviteUser"
        />
      </form>
    </section>
    <section>
      <h2>Registered Users</h2>
      <div
        class="error"
        v-if="listError"
      >{{ listError }}</div>
      <div class="user-list">
        <div
          v-for="user in users"
          class="user"
          :key="`user-id-${user.id}`"
        >
          <span class="email">{{ user.email }}</span>
          <toggle
            :value="user.cms"
            @input="() => togglePermission(user, 'cms')"
          >
            <template v-slot:active>
              <Newspaper />
            </template>
            <template v-slot:inactive>
              <Newspaper />
            </template>
          </toggle>
          <toggle
            :value="user.editor"
            @input="() => togglePermission(user, 'editor')"
          >
            <template v-slot:active>
              <ListBox />
            </template>
            <template v-slot:inactive>
              <ListBox />
            </template>
          </toggle>
          <toggle
            :value="user.super"
            @input="() => togglePermission(user, 'super')"
          >
            <template v-slot:active>
              <KingIcon />
            </template>
            <template v-slot:inactive>
              <PawnIcon />
            </template>
          </toggle>
          <copy-field :value="getInvitePath(user.email)" />

          <dynamic-delete-button @delete="deleteUser(user.id)" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Query from '../../database/query';
import ErrorMessage from '../ErrorMessage.vue';
import CopyField from '../forms/CopyField.vue';
import BackHeader from '../layout/BackHeader.vue';
import Toggle from '../layout/buttons/Toggle.vue';
import DynamicDeleteButton from '../layout/DynamicDeleteButton.vue';

import KingIcon from 'vue-material-design-icons/ChessKing.vue';
import PawnIcon from 'vue-material-design-icons/ChessPawn.vue';

import Newspaper from 'vue-material-design-icons/Newspaper.vue';
import ListBox from 'vue-material-design-icons/ListBox.vue';

export default {
  components: {
    BackHeader,
    CopyField,
    DynamicDeleteButton,
    ErrorMessage,
    KingIcon,
    PawnIcon,
    Toggle,
    Newspaper,
    ListBox,
  },
  data: function () {
    return {
      listError: '',
      inviteEmail: '',
      users: [],
    };
  },
  mounted: function () {
    this.refreshUserList();
  },
  methods: {
    getInvitePath: function (email) {
      return window.location.origin + '/invite/' + email;
    },
    deleteUser: async function (id) {
      await Query.raw(`mutation{deleteUser(id:${id})}`);
      this.refreshUserList();
    },
    refreshUserList: async function () {
      let result = await Query.raw(`{
            users{
                email
                id
                super
                permissions
            }
        }`);

      if (result && result.data && result.data.data && result.data.data.users) {
        this.users = result.data.data.users.map((user) => {
          return {
            email: user.email,
            id: user.id,
            super: user.super,
            editor: user.permissions.includes('editor'),
            cms: user.permissions.includes('cms'),
            permissions: user.permissions,
          };
        });

        this.listError = '';
      } else {
        this.users = [];
        this.listError = 'Nutzerliste konnte nicht geladen werden!';
      }
    },
    togglePermission: async function (user, permissionName) {

      let grant
      if (permissionName === 'super') {
        grant = !user.super
      } else {
        grant = !user.permissions.includes(permissionName)
      }

      const method = grant
        ? 'grantPermission'
        : 'revokePermission';
      try {
        await Query.raw(
          `mutation TogglePermission($user: ID!, $permission:String!){
        ${method}(user: $user, permission: $permission)
      }`,
          { user: user.id, permission: permissionName }
        );

        this.refreshUserList()

      } catch (err) {
        console.error(err);
        this.$store.commit('printError', err);
      }

      this.$nextTick(() => this.refreshUserList());
    },
    inviteUser: async function () {
      Query.raw(
        `mutation{
          inviteUser(email: "${this.inviteEmail}")
        }`
      )
        .then((result) => {
          this.inviteEmail = '';
          this.refreshUserList();
        })
        .catch((err) => {
          console.error(err);
          this.$store.commit('printError', err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
form {
  @include box;
}

form>* {
  display: block;
  margin-top: $padding;
}

.user {
  display: grid;
  grid-template-columns: 3fr 40px 40px 40px 5fr 40px;
  gap: $padding;
  align-items: center;
  margin: $padding 0;
}

.toggle-button {
  @include input();
  @include interactive();
}
</style>
