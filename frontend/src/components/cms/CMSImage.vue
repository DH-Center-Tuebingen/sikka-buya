<template>
  <div class="image" :class="mode">
    <div v-if="$store.getters.canEdit" class="cms-image-container" :class="{ hovered: hover }"
      @mouseenter="() => (hover = true)" @mouseleave="() => (hover = false)">
      <loading-spinner v-if="loading" :size="LoadingSpinnerSize.Big" />
      <img v-if="imageURI" :src="imageURI" alt="" />
      <image-icon v-else :size="IconSize.Big" />
      <label ref="label" class="button" @click.stop>
        <upload-icon :size="IconSize.Large" />
        <input id="file-upload-field" type="file" accept=".png,.jpg,.jpeg,image/*" @input="uploadFile" />
      </label>
    </div>
    <img v-else :src="imageURI" :draggable="false" />
  </div>
</template>

<script>
import ImageIcon from 'vue-material-design-icons/Image';
import UploadIcon from 'vue-material-design-icons/Upload';

import Query from '../../database/query';
import Button from '../layout/buttons/Button.vue';
import LoadingSpinner from '../misc/LoadingSpinner.vue';

export default {
  components: { ImageIcon, LoadingSpinner, Button, UploadIcon },
  props: {
    identity: {
      required: true,
      type: String,
    },
    mode: {
      type: String,
      default: 'cover',
      validator(value) {

        if (!value) return true;
        else return ['contain', 'cover'].includes(value);
      },
    },
  },
  data() {
    return {
      imageURI: null,
      loading: false,
      hover: false,
    };
  },
  created() {
    this.load();
  },
  computed: {
    fullIdentity() {
      return `cms[$]images[$]${this.identity}`
    }
  },
  methods: {
    load: async function () {
      if (this.identity) {
        let result = await Query.raw(`{getImage(identity:"${this.fullIdentity}")}`);
        this.imageURI = result?.data?.data?.getImage;
      } else {
        this.$store.commit("printError", "Die Komponente hat keinen 'identity'-Schlüssel. Daher kann die Datei nicht hochgeladen werden!")
      }
    },
    uploadFile: async function (event) {
      this.loading = true;
      this.imageURI = null;
      const file = event.target.files[0];
      try {
        await Query.uploadFile(this.fullIdentity, file);
        await this.load();
      } catch (e) {
        this.$store.commit("printError", e)
      }
      this.loading = false;
    },
    // manualClickOnLabel(event) {
    //   console.log(event)
    //   event.stopPropagation()
    //   // Not sure why the label is ignored.
    //   this.$refs.label.click();
    // },
  },
};
</script>

<style lang='scss' scoped>
.image {
  display: flex;
  position: relative;
}

label {
  position: absolute;
  top: 0;
  right: 0;
  margin: $padding;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.material-design-icon {
  color: $primary-color;
}

#file-upload-field {
  display: none;
}

label {
  display: none;
}

.cms-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: content-box;

  &:hover {

    label {
      display: block;
    }

    &::before {
      content: "";
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border: 3px dotted $primary-color;
      box-sizing: border-box;
      pointer-events: none;
    }
  }
}

.cover {
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.contain {
  img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }
}
</style>