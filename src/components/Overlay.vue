<script setup lang="ts">
import { RGB } from "../resources/colors/RGB";
import FadeTransition from "./FadeTransition.vue";

withDefaults(defineProps<{ active: boolean; opacity?: number; color?: RGB }>(), {
  opacity: 0.7,
  color: () => new RGB(0, 0, 0),
});
</script>

<template>
  <Teleport to="body">
    <FadeTransition>
      <div v-show="active" class="overlay">
        <slot />
      </div>
    </FadeTransition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  z-index: 1;

  width: 100dvw;
  height: 100dvh;

  background-color: rgba(
    v-bind("color.r"),
    v-bind("color.g"),
    v-bind("color.b"),
    v-bind("opacity")
  );

  backdrop-filter: blur(4px);
}
</style>
