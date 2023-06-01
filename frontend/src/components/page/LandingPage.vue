<template>
  <div
    id="landing-page"
    class="page"
  >
    <section>
      <div class="logo-showcase">
        <div class="content-wrapper grid col-3">
          <div
            id="uni-logo"
            class="cell smaller"
          >
            <CMSImage
              mode="contain"
              identity="logo.supporter_1"
            />
          </div>
          <div class="cell">
            <img
              class="sikka-buya-logo"
              src="/image/logos/sikka-buya-logo.png"
              alt="Logo des Sikka-Buya Projektes"
            />
          </div>
          <div
            id="thyssen-logo"
            class="cell smaller"
          >
            <CMSImage
              mode="contain"
              identity="logo.supporter_2"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="columns content-wrapper">
      <div class="main-column">
        <section>
          <CMSView group="landing_page_main_article" />
        </section>
        <CMSListView
          class="news"
          group="news"
          :showTime="false"
        />
      </div>
      <aside>
        <section>
          <card-link
            class="alternative-card-link"
            :to="{ name: 'Map Overview' }"
            identity="landing-page-map-link"
            direction="row"
          >
            <locale path="routes.map" />
          </card-link>
          <card-link
            class="alternative-card-link"
            :to="{ name: 'Catalog Overview' }"
            identity="landing-page-catalog-link"
            direction="row"
          >
            <locale path="routes.catalog" />
          </card-link>
        </section>

        <section class="alternate-buttons">
          <card-link
            class="subtle-card-link alternative-card-link"
            :disabled="true"
            :noImage="true"
            :to="{
              name: 'CMSList',
              params: {
                group: 'bibliography',
              }
            }"
          >
            <div class="subtitled">
              <locale path="cms.bibliography" />
              <span class="subtitle">Demnächst verfügbar!</span>
            </div>

          </card-link>

          <card-link
            class="subtle-card-link alternative-card-link"
            :disabled="true"
            :noImage="true"
            :to="{
              name: 'CMSList',
              params: {
                group: 'working_papers',
              }
            }"
          >

            <div class="subtitled">
              <locale path="cms.Working Papers" />
              <span class="subtitle">Demnächst verfügbar!</span>
            </div>
          </card-link>
        </section>

        <section>

          <div class="box fint-box">
            <h2>
              <Locale path="custom.fint.title" />
            </h2>
            <p>
              <Locale path="custom.fint.description" />

              <br>
              <a href="https://www.fint-ikmk.uni-tuebingen.de/ikmk/home">
                <Locale path="custom.fint.to" />
              </a>
            </p>

            <form
              class="flex row"
              method="post"
              action="https://www.fint-ikmk.uni-tuebingen.de/ikmk/quick_search?lang=de"
            >
              <input
                type="hidden"
                name="search_type"
                value="quick_search"
              >
              <input
                name="quick_search_value"
                type="text"
                style="flex:1"
              >

              <button
                style="margin-left: 1rem;"
                type="submit"
              >
                <Icon
                  type="mdi"
                  :path="icons.search"
                  :size="20"
                />
                <Locale path="general.search" />
              </button>

            </form>
          </div>
        </section>
      </aside>
    </div>
    <page-footer />
  </div>
</template>

<script>
import LoginVariant from 'vue-material-design-icons/LoginVariant';
import CMSImage from '../cms/CMSImage.vue';
import Locale from '../cms/Locale.vue';
import Button from '../layout/buttons/Button.vue';
import Row from '../layout/Row.vue';
import Navigation from '../Navigation.vue';
import CardLink from '../navigation/CardLink.vue';
import PageFooter from './PageFooter.vue';
import CMSView from '../cms/CMSView.vue';
import CMSListView from './cms/CMSListView.vue';
import iconMixin from "../mixins/icons"
import { mdiMagnify } from '@mdi/js/mdi';



export default {
  components: {
    Button,
    CardLink,
    CMSImage,
    CMSListView,
    CMSView,
    Locale,
    LoginVariant,
    Navigation,
    PageFooter,
    Row,
  },
  mixins: [iconMixin({'search': mdiMagnify})]
};
</script>

<style lang="scss">
#landing-page {


  .alternative-card-link {
    // max-height: 300px;

    &.card-link-image {
      height: 300px;
      // aspect-ratio: 3/2;

      .image {
        flex: 1;
      }

      article {
        width: 180px;
      }
    }


  }

  .navigation {
    position: relative;

    .brand {
      display: none;
    }

    .nav-menu {
      flex: 1;
      padding: 0;
    }

    nav {
      width: 100%;

      ul {
        display: flex;
        width: 100%;

        >li {
          flex: 1;
          text-align: center;

          $light-border: 1px solid whitesmoke;

          &:first-of-type {
            border-left: $light-border;
          }

          border-right: $light-border;

          transition: all 0.3s;

          >a {
            font-weight: bold;
            box-sizing: border-box;
            padding: 0.8em 0;
            color: $gray;
            border-bottom: 2px solid $white;

            transition: all 0.3s;

            &:hover {
              color: $dark-gray;
              background-color: whitesmoke;
              border-bottom: 2px solid $primary-color;
            }
          }
        }
      }
    }
  }


  .news {
    .cms-list-item {
      background-color: white;
      border-radius: $border-radius;
      padding: 1em;

      box-shadow: $shadow;

      :first-child {
        margin-top: 0;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
#header-left-image {
  position: absolute;
  top: 50%;
  left: 0;
  height: 66%;
  min-width: 300px;
  transform: translateY(-50%);
  pointer-events: all;
}

#hero-header {
  display: flex;
  min-height: 100px;
  max-height: 35vh;

  .cms-image {
    flex: 1;
  }

  .content-wrapper {
    z-index: 1;
  }

  .content {
    height: 100%;
  }

  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    box-shadow: inset 0 0 $shadow-spread $strong-shadow-color;
    position: absolute;
    left: -10px;
    top: 0;
    bottom: 0;
    right: -10px;
    z-index: 1;
    pointer-events: none;
  }

  .content-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}

section:first-of-type {
  margin-top: 0;
}

.logo-showcase {
  position: relative;
  background-color: white;
  min-height: 50px;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 3rem;

  .content-wrapper {
    padding: 0 100px;

    @include media_tablet {
      padding: 0 20px;
    }
  }

  .cell {
    align-self: center;
  }

  .smaller {
    max-height: 50%;
  }

  &:before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    border-bottom: 6px dotted white;
    box-sizing: border-box;
  }

  .grid {
    grid-template-columns: 1fr 2fr 1fr;

    @include media-tablet {
      gap: 20px;
    }

    .cell {
      display: flex;
      box-sizing: border-box;
      justify-content: center;
      margin: 20px 50px;

      img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
  }
}

.box {
  border-radius: $border-radius;

  padding: $large-box-padding;

  h2 {
    margin-top: 0;
  }
}

.fint-box {
  background-color: #1d6a8e;
  color: $dark-white;

  h2 {
    color: white;
  }

  a {
    color: #e98a63;
  }
}


.columns {
  display: grid;
  grid-template-columns: 10fr 10fr;
  gap: 50px;
}

aside {

  display: flex;
  flex-direction: column;
  gap: $padding;

  h2 {
    color: gray;
  }

  section {
    margin-bottom: 1.5rem;

    >* {

      margin-bottom: $padding;
    }
  }

}
</style>