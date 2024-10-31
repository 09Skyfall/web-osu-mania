<script setup lang="ts">
import FpsCounter from "./components/FpsCounter.vue";
import { RouterView } from "vue-router";
import ImportButton from "./resources/beatmap/ImportButton.vue";
</script>

<template>
  <RouterView />
  <ImportButton style="position: absolute; right: 0; bottom: 0; transform: translate(30%, 30%)" />
  <fps-counter />
</template>
