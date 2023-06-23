<template>
  <div class="page cms-edit-page">
    <section class="content-wrapper">

      <h2>
        <Locale :path="`cms.${this.group}`" />
      </h2>
      <div class="tools">


        <CMSSaveButton
          :autoSave="autoSave"
          :saving="saving"
          :dirty="prevent_navigation_mixin_isDirty"
          @changeAutoSave="(val) => autoSave = val"
          @save="save"
        />


        <HollowButton
          class="auto-save-button"
          :class="{ active: autoSave }"
          @click.native="() => autoSave = !autoSave"
          :interactive="true"
        >
          <Icon
            type="mdi"
            :path="(autoSave) ? icons.autoSave : icons.save"
            :size="16"
          />
          <Locale :path="(autoSave) ? 'cms.disable-auto-save' : 'cms.enable-auto-save'" />
        </HollowButton>

        <Spacer />

        <CMSPublicationInput
          :value="parseInt(page.publishedTimestamp)"
          @input="updatePublishedTimestamp"
        />


        <CMSPublicationStatus
          :value="parseInt(lastPublishedTimestamp)"
          @click.native="unpublish"
        />

        <HollowButton
          v-if="!published"
          class="publish-button"
          @click.native="publish"
          :interactive="true"
        >
          <Icon
            type="mdi"
            :path="(scheduled) ? icons.clock : icons.publish"
            :size="16"
          />
          <Locale :path="(scheduled) ? 'cms.schedule' : 'general.publish'" />
        </HollowButton>


      </div>




      <!-- <CMSEditToolbar
        v-if="editmode"
        :autoSave="autoSave"
        :publishedTimestamp="lastPublishedTimestamp"
        :dirty="prevent_navigation_mixin_isDirty"
        :saving="saving"
        :page="page"
        @action="execToolbarAction"
        @save="save"
        @publish="publish"
        @updatePage="updatePage"
      /> -->


      <template v-show="!loading">
        <div
          class="info grid col-3"
          v-if="showTime"
        >
          <div class="cell">
            <label for="">Erstellt am</label>
            {{ time_mixin_formatDate(page.createdTimestamp) }}
          </div>
          <div class="cell">
            <label for="">Zuletzt geändert am</label>
            {{ time_mixin_formatDate(page.modifiedTimestamp) }}
          </div>
          <div class="cell">
            <label for="">Veröffentlicht am</label>
            {{ time_mixin_formatDate(page.publishedTimestamp) }}
          </div>
        </div>
        <h1
          :contenteditable="editmode"
          @input="update"
          @paste="update"
          data-property="title"
          v-show="isPresent('title')"
          ref="title"
          v-once
        >
          {{ page.title }}
        </h1>

        <h2
          v-show="hasSubtitle"
          :contenteditable="editmode"
          @input="update"
          @paste="update"
          data-property="subtitle"
          ref="subtitle"
          v-once
        >
          {{ page.subtitle }}
        </h2>

        <p
          v-show="!editmode"
          name=""
          id=""
          cols="30"
          rows="10"
        ></p>
        <SimpleFormattedField
          ref="body"
          :allowLinks="allowLinks"
          @hook:mounted="() => selfInitialize('body')"
          @input="(value) => this.updateFormattedField('body', value)"
          v-show="editmode"
        />

        <!-- <section v-if="hasBlocks">
        <h2>Blocks</h2>

        <textarea
          v-for="block of   page.blocks"
          class="page-block"
          :contenteditable="editmode"
          @keydown="($event) => handleSpecialKeys($event, block)"
          @input="($event) => updateBlockText($event, block)"
          :key="`page-block-${block.id}`"
          :ref="`page-block-${block.id}`"
          v-model="block.text"
        />
        <div class="content-wrapper">
          <async-button @click="addEmptyBlock()">Add</async-button>
        </div>
      </section> -->
      </template>


    </section>
  </div>
</template>

<script>
// Components
import AsyncButton from '../../layout/buttons/AsyncButton.vue';
import HollowButton from '../../layout/buttons/HollowButton.vue';
import CMSPage from '../../../models/CMSPage';
import CMSPublicationStatus from '../../cms/CMSPublicationStatus.vue';
import CMSPublicationInput from '../../cms/CMSPublicationInput.vue';
import CMSSaveButton from '../../cms/CMSSaveButton.vue';
import Locale from '../../cms/Locale.vue';
import SimpleFormattedField from '../../forms/SimpleFormattedField.vue';
import Spacer from '../../layout/Spacer.vue';

// Mixins
import LocalStorageMixin from '../../mixins/local-storage-mixin';
import IconMixin from '../../mixins/icon-mixin';
import CopyAndPasteMixin from '../../mixins/copy-and-paste';
import MountedAndLoadedMixin from '../../mixins/mounted-and-loaded';
import PreventNavigationMixin from '../../mixins/prevent-navigation-mixin';
import TimeMixin from '../../mixins/time-mixin';

// Utilities
import CMSConfig from '../../../../cms.config';
import Query from '../../../database/query';
import { InputDelayer } from "../../../models/request-buffer"
import { mdiPublish, mdiClock, mdiContentSaveOutline, mdiSync } from '@mdi/js';

export default {
  components: {
    AsyncButton,
    CMSPublicationStatus,
    CMSSaveButton,
    HollowButton,
    Locale, CMSPublicationInput,
    SimpleFormattedField,
    Spacer,
  },
  mixins: [TimeMixin, MountedAndLoadedMixin, CopyAndPasteMixin, PreventNavigationMixin, LocalStorageMixin('cms', ['autoSave']), IconMixin({ clock: mdiClock, publish: mdiPublish, save: mdiContentSaveOutline, autoSave: mdiSync })],
  mounted() {
    this.load()

    this.$nextTick(() => {
      this.implementedContenteditableRefs.forEach(ref => {
        this.initPastePlainText(ref)
      })
    })
  },
  beforeDestroy() {
    [this.$refs["title"], this.$refs["subtitle"]].forEach(this.cleanupPastePlainText)
  },
  props: {
    useBlocks: Boolean,
    group: String,
    include: {
      type: Array,
      default: () => [],
    },
    exclude: {
      type: Array,
      default: () => [],
    },

  },
  data() {
    return {
      updateBuffer: null,
      autoSaveDelayer: new InputDelayer(300),
      autoSave: true,
      allowLinks: true,
      loading: true,
      saving: false,
      editmode: true,
      lastPublishedTimestamp: null,
      page: {
        title: null,
        subtitle: null,
        summary: null,
        body: null,
        image: null,
        createdTimestamp: null,
        publishedTimestamp: null,
        modifiedTimestamp: null,
        blocks: [],
      },
    };
  },
  methods: {
    updatePublishedTimestamp(ts) {
      this.page.publishedTimestamp = ts
      this.changed()
    },
    async load() {
      try {
        const page = await CMSPage.get(this.id)
        this.lastPublishedTimestamp = parseInt(page.publishedTimestamp);
        this.page = Object.assign({}, this.page, page);
        this.implementedFields.forEach(this.selfInitialize);
      } catch (e) {
        console.error(e)
      }

      this.loading = false;
      this.isLoaded();
    },
    execToolbarAction(action) {
      switch (action) {
        case 'publish':
          this.publish();
          break;
        case 'unpublish':
          this.unpublish()
          break;
        case 'enable-auto-save':
          this.autoSave = true;
          this.changed()
          break;
        case 'disable-auto-save':
          this.autoSave = false;
          break;
        default:
          console.error(`Action ${action} not implemented yet`)
          break;
      }
    },
    selfInitialize(name) {
      if (!this.$refs[name]) console.error(`There is no ref with name ${name}`);
      else {
        if (this.$refs[name]._isVue)
          if (this.$refs[name].$options.name === 'SimpleFormattedField')
            this.$refs[name].setContent(this.page[name]);
          else throw new Error('Not implemented yet')
        else {
          this.$refs[name].innerHTML = this.page[name];
        }
      }
    },
    isPresent(name) {
      const configsFileInclude = CMSConfig[this.group]?.include || [];
      const componentInclude = this.include || [];
      let include = [...configsFileInclude, ...componentInclude];

      if (include.length > 0) {
        return include.includes(name);
      }

      return true;
    },
    updatePage(key, value) {
      this.page[key] = value;
      this.prevent_navigation_mixin_setDirty()
    },
    async handleSpecialKeys($event, block) {
      if ($event.key === 'Enter') {
        $event.preventDefault();
        $event.stopPropagation();
      }

      if ($event.key === 'Backspace') {
        const target = $event.currentTarget;
        const value = target.textContent || target.value;
        if (value === '') {
          await Query.raw(
            `
          mutation DeleteBlock($id:ID!){deleteBlock(id: $id)}
        `,
            { id: block.id },
            true
          );

          const idx = this.page.blocks.findIndex(
            (otherBlock) => block.id === otherBlock.id
          );

          this.$delete(this.page.blocks, idx);
        }
      }
    },
    updateBlockText($event, block) {
      block = Object.assign({}, block);
      const id = block.id;
      delete block.id;

      const target = $event.currentTarget;
      this.adjustHeight(target);

      block.text = target.value;

      this.saving = true;
      this.updateBuffer.update(block, async () => {
        await Query.raw(
          `
        mutation UpdatePageBlock($id: ID!, $block: PageBlockInput){
          updateBlock(id: $id, block: $block)
          }
        `,
          { id, block }
        );
        this.saving = false;
      });
    },
    adjustHeight(target) {
      const targetHeight =
        target.scrollHeight >= target.clientHeight
          ? target.scrollHeight + 'px'
          : '60px';

      target.style.height = targetHeight;
    },
    updateFormattedField(property, value) {
      this.page[property] = this.$refs[property].getContent();
      this.changed()
    },
    update($event) {
      const target = $event.currentTarget;
      const property = target.getAttribute('data-property');
      if (!property)
        throw new Error(`Attribute 'data-property' is missing on component!`);
      else {
        if (target.hasAttribute('contenteditable')) {
          this.page[property] = target.innerHTML;

        } else {
          this.page[property] = target.value;
        }
      }

      this.changed()
    },
    changed() {
      if (this.autoSave) {
        this.autoSaveDelayer.update(() => this.save())
      }
      this.prevent_navigation_mixin_setDirty()
    },
    async unpublish() {
      if (this.page.publishedTimestamp && confirm('Are you sure you want to unpublish this page?')) {
        await this.publish(false)
      }
    },
    async publish(publish = true) {

      let publishedTimestamp = null;
      if (publish) {
        let pageTimestamp = parseInt(this.page.publishedTimestamp)
        publishedTimestamp = isNaN(pageTimestamp) && pageTimestamp > 0 ? pageTimestamp : new Date().getTime()
      }

      // We override the modifiedTimestamp to exclude the 'publishing'
      // to be considered as a modification.
      await this.save({ publishedTimestamp, modifiedTimestamp: this.page.modifiedTimestamp })
    },
    async save(overrides = {}) {
      this.saving = true;

      const page = Object.assign({
        title: this.page.title,
        subtitle: this.page.subtitle,
        summary: this.page.summary,
        body: this.page.body,
        image: this.page.image,
        createdTimestamp: this.page.createdTimestamp,
        modifiedTimestamp: this.page.modifiedTimestamp,
      }, overrides);

      if (page.publishedTimestamp)
        page.publishedTimestamp = page.publishedTimestamp.toString()

      this.page = page
      await CMSPage.update(this.id, page);
      await (async function (ts) {
        return new Promise(resolve => setTimeout(resolve, ts))
      })(3000)

      // Update page values, as the saving
      this.lastPublishedTimestamp = parseInt(page.publishedTimestamp)

      this.prevent_navigation_mixin_setClean()
      this.saving = false;
    },
    async addEmptyBlock() {
      const position = 10;
      const group = 'empty';
      const result = await Query.raw(
        `
mutation CreatePageBlock($id: ID!, $group:String!, $position: Int!) {
  createBlock(parent: $id, block: {group: $group, position: $position})
}

      `,
        {
          id: this.id,
          position,
          group,
        },
        true
      );

      const id = result.data.data.createBlock;
      const block = {
        id,
        group,
        position,
        image: null,
        text: '',
        parent: null,
        page: this.id,
      };
      let i = 0;
      while (
        i < this.page.blocks.length &&
        position <= this.page.blocks[i].position
      ) {
        i++;
      }

      this.page.blocks.splice(i, 0, block);
      this.$forceUpdate();
    },
  },
  computed: {
    scheduled() {
      const ts = parseInt(this.page.publishedTimestamp)
      return !isNaN(ts) && ts > new Date().getTime()
    },
    published() {
      const ts = parseInt(this.lastPublishedTimestamp)
      return !isNaN(ts) && ts > 0
    },
    implementedContenteditableRefs() {
      return this.implementedContenteditables.map(name => this.$refs[name])
    },
    implementedContenteditables() {
      return ['title', 'subtitle']
    },
    implementedFields() {
      return ['title', 'subtitle', 'body']
    },
    id() {
      return this.$route.params.id;
    },
    showTime() {
      return Boolean(CMSConfig?.[this.group]?.page?.showTime);
    },
    hasBody() {
      return (
        this.isPresent('body') && (this.editmode || this.page.subtitle != '')
      );
    },
    hasSubtitle() {
      return (
        this.isPresent('subtitle') &&
        (this.editmode || this.page.subtitle != '')
      );
    },
    hasBlocks() {
      return (
        this.useBlocks &&
        this.isPresent('blocks') &&
        (this.editmode || (this.page.blocks && this.page.blocks.length > 0))
      );
    },
  },
};
</script>

<style lang="scss">
.cms-edit-page {
  .cms-publication-status {

    &.draft {
      color: $dark-yellow;
    }

    &.published {
      background-color: $blue;
      color: white;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>

<style lang="scss" scoped>
h2 {
  margin: 0;
  margin-top: 1em;
}

.auto-save-button {

  &.active {

    color: $purple;
  }
}

.publish-button {
  color: $blue;
}

.tools {
  position: sticky;
  top: 0;
  display: flex;
  gap: .5em;
  z-index: 10;
  background-color: whitesmoke;
  padding: 2em 0 1em 0;
  justify-content: flex-end;
}

.toolbar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: whitesmoke;
  padding: $padding;
  margin-top: 2em;
  // box-shadow: 0 0 $shadow-spread $strong-shadow-color;

  >* {

    display: flex;
    flex-direction: row-reverse;
  }
}

.cms-edit-toolbar {
  margin-top: $padding;
}

.page {
  margin-bottom: $page-bottom-spacing;
  display: flex;

  .content-wrapper {
    flex: 1;
  }
}

h1 {
  margin-top: 1rem;
}

.info {
  margin-top: 1rem;
}

*[contenteditable],
input,
textarea {
  border: none;
  display: block;
  width: 100%;
  resize: none;
  padding: 0.3rem;
  background-color: $dark-white;
  border-radius: $border-radius;
  box-shadow: inset $shadow;
  box-sizing: border-box;
}

.page-block {
  margin: 1rem 0;
}
</style>