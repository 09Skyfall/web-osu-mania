<script setup lang="ts">
import { ref } from "vue";
import { useCanvas } from "../composables/useCanvas";

withDefaults(defineProps<{ height?: string; width?: string }>(), {
  width: "100%",
  height: "100%",
});

const { canvas, ctx } = useCanvas();

const computed_width = ref(0);
const computed_height = ref(0);

// eslint-disable-next-line no-undef
const onResize: ResizeObserverCallback = ([entry]) => {
  computed_width.value = entry.contentRect.width;
  computed_height.value = entry.contentRect.height;
};

defineExpose({ canvas, ctx });
</script>

<template>
  <div v-resize="onResize" class="responsive-canvas">
    <canvas ref="canvas" :width="computed_width" :height="computed_height" />
  </div>
</template>

<style scoped>
.responsive-canvas {
  width: v-bind("width");
  height: v-bind("height");
}
</style>
