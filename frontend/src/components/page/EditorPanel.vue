<template>
  <div>
    <header>
      <h2>
        <locale path="editor.administration" />
      </h2>


    </header>

    <div class="flex row">

      <div class="flex-fill">
        <template v-for="permission of ['super', 'cms', 'editor']">
          <list
            :items="getPropertyByPermission(permission)"
            v-if="$store.getters.userHasPermission(permission) &&
              getPropertyByPermission(permission).length > 0
              "
            :key="'list-' + permission"
          >
            <list-header>{{ $tc('user.permission.' + permission) }}</list-header>
            <list-item
              v-for="(property, idx) of getPropertyByPermission(permission)"
              :key="'prop-' + idx"
              :to="property.to"
            >
              <span>
                <locale :path="'property.' + property.name" />
              </span>
            </list-item>
          </list>
        </template>

        <list :items="supportPrograms">
          <list-header>
            <locale :path="'editor.assist_tools'" />
          </list-header>
          <list-item
            v-for="(property, idx) of supportPrograms"
            :key="'prop-' + idx"
            :to="property.to"
          >
            <span>
              <locale :path="'editor.' + property.name" />
            </span>
          </list-item>
        </list>
      </div>

      <aside class="quick-access">
        <h4>
          <Locale path="system.quick_access" />
        </h4>
        <div class="items">
          <router-link
            v-for="(item, idx) of quickAccessItems"
            :to="item.to"
            :key="`quick-access-${idx}`"
          >
            <button>
              <locale :path="item.locale" />
            </button></router-link>
        </div>
      </aside>

    </div>
  </div>
</template>

<script>
import PlusBox from 'vue-material-design-icons/PlusBox';
import Auth from '../../utils/Auth';
import Locale from '../cms/Locale.vue';
import Button from '../layout/buttons/Button.vue';
import List from '../layout/List.vue';
import ListHeader from '../layout/list/ListHeader.vue';
import ListItem from '../layout/ListItem.vue';


import { QuickAccessItems } from '../../config/quickaccess.js';

export default {
  name: 'EditorPanel',
  components: {
    PlusBox,
    List,
    ListItem,
    ListHeader,
    Button,
    Locale,
  },
  methods: {
    getPropertyByPermission(permission) {
      if (this.user_properties[permission]) {
        return this.user_properties[permission];
      } else return [];
    },
  },
  computed: {
    quickAccessItems() {
      return QuickAccessItems
    },
    user_properties() {
      return {
        super: [
          { name: 'user', to: { name: 'UserManagement' } },
          { name: 'settings', to: { name: 'Settings' } }
        ],
        cms: this.properties,
      };
    },
    supportPrograms() {
      return [
        { name: 'expert_search', to: { name: 'ExpertSearch' } },
        { name: 'compare_last_cleanup', to: { name: 'FixDiff' } },
      ];
    },
    properties() {
      let props = [
        'coin_mark',
        'coin_verse',
        'dynasty',
        'honorific',
        'material',
        'mint',
        'mint_area',
        'nominal',
        'person',
        'province',
        'role',
        'title',
        'treasure',
        'type',
      ];

      let propertyMap = {
        person: 'PersonOverview',
        material: 'MaterialOverview',
        coin_mark: 'CoinMarkOverview',
        type: 'TypeOverview',
      };

      props = props.sort((a, b) =>
        this.$tc('property.' + a).localeCompare(this.$tc('property.' + b))
      );

      props = props.map((name) => {
        if (propertyMap[name]) {
          return {
            name,
            to: { name: propertyMap[name] },
          };
        } else {
          return {
            name,
            to: { name: 'Property', params: { property: name } },
          };
        }
      });

      return props;
    },
    superuser: function () {
      let user = Auth.loadUser();
      return user.super || false;
    },
  },
};
</script>

<style lang="scss" scoped>
a {
  @include resetLinkStyle();
}

header {
  display: flex;
  justify-content: space-between;
}

h1,
h2,
h3 {
  text-transform: capitalize;
}

h3 {
  margin-top: 50px;
  padding-bottom: 0.5em;
  border-bottom: 1px solid black;
}

.draft {
  position: relative;
}

.draft::before {
  content: 'DRAFT';
  font-family: $font;
  font-size: 0.5rem;
  color: white;
  font-weight: bold;
  background-color: $red;
  padding: 5px 20px;
  position: absolute;
  top: 0;
  transform: translate(20px, -50%);
}

.quick-access {

  margin: 0 $padding;
  min-width: 200px;

  background-color: $dark-white;
  padding: $padding;
  margin-bottom: $padding;
  border-radius: $border-radius;
  box-shadow: inset $shadow;

  h4 {
    margin: 0;
    margin-bottom: $padding;
    color: $gray;
  }

  .items {
    // display: flex;

    >* {
      flex: 1;
      display: flex;
      max-width: 200px;
      margin-bottom: $padding;

      button {
        flex: 1;
        padding: 2*$padding $padding;
      }
    }
  }
}
</style>