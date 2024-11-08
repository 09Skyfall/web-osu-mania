<script setup lang="ts">
import { useCanvas } from "../composables/useCanvas";
import { assert } from "../utils/assertions/assert";

const p = withDefaults(defineProps<{ height?: string; width?: string; redraw?: () => void }>(), {
  width: "100%",
  height: "100%",
});

const { canvas, ctx } = useCanvas();

// eslint-disable-next-line no-undef
const onResize: ResizeObserverCallback = ([entry]) => {
  assert(canvas.value);
  canvas.value.width = Math.floor(entry.contentRect.width);
  canvas.value.height = Math.floor(entry.contentRect.height);
  if (p.redraw) p.redraw();
};

defineExpose({ canvas, ctx });
</script>

<template>
  <div v-resize="onResize" class="responsive-canvas">
    <canvas ref="canvas" :width="0" :height="0" />
  </div>
</template>

<style scoped>
.responsive-canvas {
  width: v-bind("width");
  height: v-bind("height");
}
</style>
