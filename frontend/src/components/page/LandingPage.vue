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
            :disabled="$mconfig.getBoolean('bibliography.disabled')"
            :noImage="true"
            :to="{
              name: 'Bibliography',
            }"
          >
            <div class="subtitled">
              <locale path="cms.group.bibliography" />
            </div>

          </card-link>
          <card-link
            class="subtle-card-link alternative-card-link"
            :noImage="true"
            :disabled="$mconfig.getBoolean('working_papers.disabled')"
            :to="{
              name: 'Working Papers'
            }"
          >

            <div :class=" { subtitled: $mconfig.getBoolean('working_papers.disabled') } ">
              <locale path="cms.group.Working Papers" />
              <span
                class="subtitle"
                v-if=" $mconfig.getBoolean('working_papers.disabled') "
              >Demnächst verfügbar!</span>
            </div>
          </card-link>
        </section>

        <section>
          <FintBox />
        </section>
      </aside>
    </div>
    <page-footer />
  </div>
</template>

<script>
import Button from '../layout/buttons/Button.vue';
import CardLink from '../navigation/CardLink.vue';
import CMSImage from '../cms/CMSImage.vue';
import CMSListView from './cms/CMSListView.vue';
import CMSView from '../cms/CMSView.vue';
import FintBox from '../navigation/FintBox.vue';
import Locale from '../cms/Locale.vue';
import LoginVariant from 'vue-material-design-icons/LoginVariant';
import Navigation from '../Navigation.vue';
import PageFooter from './PageFooter.vue';
import Row from '../layout/Row.vue';



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
    FintBox
  },
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


  // .news {
  //   // .cms-list-item {
  //   //   background-color: white;
  //   //   border-radius: $border-radius;
  //   //   padding: 1em;

  //   //   box-shadow: $shadow;

  //   //   :first-child {
  //   //     margin-top: 0;
  //   //   }
  //   // }
  // }
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