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
  <Teleport to="body">
    <div class="fps-container">
      <span class="fps-counter">{{ fps }}</span>
    </div>
  </Teleport>
</template>

<style scoped>
.fps-container {
  padding: 0 8px;
  margin: 8px;
  min-width: 5ch;

  background-color: #292524;
  border-radius: 4px;

  text-align: center;

  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9;
}

.fps-counter {
  color: var(--warning);
  font-size: 1.25rem;
}
</style>
