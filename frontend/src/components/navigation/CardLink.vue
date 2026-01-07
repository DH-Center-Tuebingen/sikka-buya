<template>
  <router-link
    class="card-link"
    :class="{ [className]: true, ['card-link-image']: !noImage, disabled }"
    :to="to"
  >
    <CMSImage
      v-if="!noImage"
      class="image"
      :identity="identity"
      :mode="imageClass"
    />
    <article>
      <header>
<arrow-right class="ugly" />
        <slot />
      </header>

      <div class="body">
        <slot name="body" />
      </div>
    </article>
  </router-link>
</template>

<script>
import ArrowRight from 'vue-material-design-icons/ArrowRight.vue';
import CMSImage from '../cms/CMSImage.vue';
export default {
  components: {
    ArrowRight,
    CMSImage
  },
  props: {
    noImage: Boolean,
    disabled: Boolean,
    to: Object || String,
    identity: String,
    contain: Boolean,
    direction: {
      validator(value) {
        if (value == null) return true
        else return ["row", "column"].includes(value)
      }
    }
  },
  computed: {
    className() {
      const imgClass = this.img ? 'card-link-image' : ''
      return [imgClass, this.directionClass].join(" ");
    },
    imageClass() {
      return this.contain ? 'contain' : 'cover';
    },
    directionClass() {
      return this.direction === "row" ? "row" : "column"
    }
  },
  mounted() {
    if (!this.noImage) {
      if (!this.identity) throw new Error(`Missing prop 'identity' for CardLink. If you don't want to use an image, set prop 'noImage' to true.`)
    }
  },
  methods: {
    clicked() {
      if (!this.disabled)
        this.$router.push(this.to)
    }
  },
};
</script>

<style lang="scss">
.card-link {



  .image {
    min-height: 50px;
  }
}
</style>

<style lang='scss' scoped>
.card-link {
  display: flex;
  flex-direction: column;
  color: $white;
  position: relative;
  background-color: $primary-color;
  border: $border;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;

  &.subtle-card-link {
    color: $primary-color;
    background-color: $white;

    &.disabled {
      background-color: $light-gray;
      color: $gray;
    }

    header {
      padding-top: $padding;
      padding-bottom: $padding;

    }
  }

  &:not(.disabled):hover {
    filter: brightness(0.90);
  }

  &.disabled {
    background-color: $gray;
    cursor: default;
  }

  .image {
    flex: 1;
  }

  footer {
    z-index: 100;
  }

  &.row {
    flex-direction: row;
  }
}



img {
  flex: 1;
}

header {
  display: inline-flex;
  font-size: $large-font;
  padding: $big-box-padding;
  align-items: center;
  text-align: right;
  align-self: flex-end;
}

footer {
  display: flex;
  justify-content: flex-end;
}

article {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.card-link-background-image {
  // position: absolute;
  // top: 0;
  // left: 0;

  max-width: 100%;
  max-height: 100%;
  object-fit: cover;

  &.contain {
    max-width: none;
    max-height: none;
    width: 20vw;
    height: 20vw;
    object-fit: contain;
    object-position: top right;
  }
}
</style>