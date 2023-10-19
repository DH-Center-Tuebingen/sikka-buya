<template>
  <div class="user-hub">
    <toggle
      :value="$store.state.editmode"
      @input="() => $store.commit('toggleEditMode')"
    >
      <template v-slot:active>
        ON
      </template>
      <template v-slot:inactive>
        OFF
      </template>
    </toggle>

    <span>
      <locale
        v-for="permission of $store.getters.permissions"
        :path="'user.permission.' + permission"
        :key="'permission-' + permission"
      />
    </span>

    <div class="toolbox">
      <Button
        :to="{ name: 'Editor' }"
        class="editor-button borderless"
      ><account-icon :size="IconSize.Normal" /></Button>
      <Button
        class="logout-button borderless"
        @click="logout"
      ><logout-variant-icon :size="IconSize.Normal" /></Button>
    </div>
  </div>
</template>

<script>
import Button from '../layout/buttons/Button.vue';
import Toggle from '../layout/buttons/Toggle.vue';
import Locale from '../cms/Locale.vue';


import AuthMixin from '../mixins/auth';

import AccountIcon from 'vue-material-design-icons/Account.vue';
import LogoutVariantIcon from 'vue-material-design-icons/LogoutVariant.vue';

export default {
  components: { Button, AccountIcon, Locale, LogoutVariantIcon, Toggle },
  mixins: [AuthMixin],
  computed: {
    // permissions() {
    //   const user = this.$store.state.user
    //   let permissions = []
    //   if (user.super) permissions.push("super")
    //   if (user.permissions?.length > 0) permissions.push(...user.permissions)
    //   return (permissions.length > 0) ? `${permissions.join(", ")}` : "Nutzer"
    // }
  }
};
</script>

<style lang='scss'>
.user-hub {
  .toggle-button>.active {
    background-color: $primary-color;
  }
}
</style>

<style lang='scss' scoped>
.user-hub {

  .toggle-button {
    border-radius: 3px;
    background-color: whitesmoke;
    margin: 3px;
    font-size: 0.65rem;

  }

  .material-design-icon {
    color: white;
  }

  span {
    flex: 1;
    padding: 0 math.div($padding, 2);
  }

  .button {
    // background-color: red;
    border-left: 1px solid $light-gray;

    &.active {

      color: $primary-color;
    }
  }

  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  background-color: $primary-color;
  min-width: 300px;
  max-width: 100%;
  text-align: center;
  color: white;
  font-weight: bold;
  box-shadow: $strong-shadow;
  border-bottom-left-radius: $border-radius;
  border-bottom-right-radius: $border-radius;

  cursor: default;
  user-select: none;
}
</style>