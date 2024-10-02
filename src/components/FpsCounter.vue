<script setup lang="ts">
import { ref } from "vue";
import { useAnimate } from "../composables/useAnimate";
import { throttle } from "lodash";

const fps = ref(0);
useAnimate(
  throttle((delta_t: number) => {
    fps.value = Math.round(1000 / delta_t);
  }, 250),
);
</script>

<template>
  <div class="fps-container">
    <span class="fps-counter">{{ fps }}</span>
  </div>
</template>

<style scoped>
.fps-container {
  padding: 0 1rem;

  background-color: black;

  position: fixed;
  top: 0;
  right: 0;
  z-index: 1;
}
.fps-counter {
  color: white;
  font-size: 32px;
}
</style>
