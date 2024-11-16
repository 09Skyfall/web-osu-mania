<script lang="ts" setup>
import { watch } from "vue";
import { delayedRef } from "../composables/delayedRef";
import { useMouse } from "../composables/useMouse";
import FadeTransition from "./FadeTransition.vue";

const p = withDefaults(
  defineProps<{ active?: boolean; delay?: number; offsetX?: number; offsetY?: number }>(),
  {
    active: true,
    delay: 25,
    offsetX: 18,
    offsetY: 18,
  },
);

const mouse = useMouse();

const x = delayedRef(mouse.x.value + p.offsetX, p.delay);
const y = delayedRef(mouse.y.value + p.offsetY, p.delay);

watch(mouse.x, (_x) => (x.value = _x + p.offsetX));
watch(mouse.y, (_y) => (y.value = _y + p.offsetY));
</script>

<template>
  <Teleport to="body">
    <FadeTransition>
      <div v-if="active" class="mouse-overlay">
        <slot />
      </div>
    </FadeTransition>
  </Teleport>
</template>

<style scoped>
.mouse-overlay {
  pointer-events: none;
  position: absolute;
  top: v-bind("`${y}px`");
  left: v-bind("`${x}px`");
  z-index: 999;
}
</style>
