<template>
  <div class="confirmation">
    <h3>Warnung!</h3>
    <div class="text">
      <slot />
    </div>
    <footer>
      <div
class="ok button big-button"
@click="$emit('result', true)"
>
Ok
</div>
      <div
class="cancel button big-button"
@click="$emit('result', false)"
>
        Abbrechen
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Confirmation',
};
</script>
<style lang="scss" scoped>
h3 {
  color: $primary-color;
  margin-top: 0;
}

.text {
  padding: $big-box-padding;
  box-sizing: border-box;
}

.confirmation {
  border-radius: 10px;
  background-color: $white;
  padding: $padding * 2;
  box-sizing: border-box;
}

footer {
  margin-top: 20px;
  display: flex;

  > * {
    flex: 1;
    text-align: center;

    &:not(:last-child) {
      margin-right: 10px;
    }
  }
}

.ok {
  color: $white;
  background-color: $primary-color;
}
</style>
