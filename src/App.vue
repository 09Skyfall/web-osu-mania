<script setup lang="ts">
import FpsCounter from "./components/FpsCounter.vue";
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
  <fps-counter />
</template>
