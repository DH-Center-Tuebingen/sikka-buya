<template>
  <MultiButton>
    <ButtonVue
      :class="{
        active: active,
      }"
      @click="selectType(type.id)"
    >
      {{ type.projectId }}
    </ButtonVue>
    <ButtonVue
      :class="{
        active: active,
      }"
    >
      <router-link
        :to="{ name: 'Catalog Entry', params: { id: type.id } }"
        target="_blank"
        >
<ExternalLinkIcon :size="16" />
</router-link>
    </ButtonVue>
  </MultiButton>
</template>

<script>
import ExternalLinkIcon from 'vue-material-design-icons/OpenInNew.vue';
import ButtonVue from '../../layout/buttons/Button.vue';
import MultiButton from '../../layout/buttons/MultiButton.vue';
export default {
  components: { ExternalLinkIcon, ButtonVue, MultiButton },
  props: {
    active: Boolean,
    type: Object,
  },
  methods: {
    selectType() {
      this.$emit('change', this.type.id);
    },
  },
};
</script>
