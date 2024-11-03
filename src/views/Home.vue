<script setup lang="ts">
import ImportButton from "../resources/beatmap/ImportButton.vue";
import List from "../resources/beatmap/List.vue";
</script>

<template>
  <List />

  <ImportButton class="home-import-button" />
</template>

<style scoped>
.home-import-button {
  position: absolute;
  right: 0;
  bottom: 5dvh;
}
</style>
