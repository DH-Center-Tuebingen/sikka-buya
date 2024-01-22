<template>
  <footer>
    <div class="footer-content">
      <div class="content-wrapper grid col-3">
        <div>
          <ul class="unstyled">
            <li><a href="https://uni-tuebingen.de/impressum/">
                <locale path="routes.impressum" />
              </a></li>
            <li><a href="https://uni-tuebingen.de/datenschutzerklaerung/">
                <locale path="routes.data_protection" />
              </a></li>
            <li>
              <router-link :to="{ name: 'Contact' }">
                <locale path="routes.contact" />
              </router-link>
            </li>
          </ul>


        </div>
        <div>
          <ul class="unstyled">
            <li><router-link :to="{ name: 'Login' }">
                <locale path="system.user_login" />
              </router-link></li>
            <li>
              <i>
                Version {{ $store.state.version  }}
              </i>
            </li>
            <li>
              <div>© 2024</div>
            </li>
          </ul>


        </div>

        <div>
          <h4>
            <locale path="general.cooperations" />:

          </h4>
          <a
            href="http://numid-verbund.de/"
            target="_blank"
          >
            <img
              class="supporter-logo"
              src="/image/logos/numid-logo.png"
              alt="Logo des Numid-Verbundes"
            ></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import CMSImage from '../cms/CMSImage.vue';
import Locale from '../cms/Locale.vue';
export default { components: { Locale, CMSImage } };
</script>

<style lang="scss"  scoped>
footer {

  position: relative;

  .footer-content {
    margin-top: 10vh;
    position: relative;
    padding: $big-padding 0;
    color: $white;
    min-height: 30vh;
    padding-top: 3rem;
    background-color: $light-gray;
  }


  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 4px;
    border-top: 6px dotted whitesmoke;
  }


  a {
    text-transform: uppercase;
    color: currentColor;
  }
}

.content-wrapper>* {
  h4 {
    margin-top: 0;
  }
}

ul li {
  margin-bottom: 0.5rem;
}
</style>