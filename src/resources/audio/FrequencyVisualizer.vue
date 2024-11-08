<script setup lang="ts">
import { ref } from "vue";
import ResponsiveCanvas from "../../components/ResponsiveCanvas.vue";
import { useAnimate } from "../../composables/useAnimate";
import { assert } from "../../utils/assertions/assert";
import { RGB } from "../colors/RGB";
import { secondary } from "../colors";

const p = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    analyser: AnalyserNode;
    vertical?: boolean;
    color?: RGB;
  }>(),
  {
    width: "100%",
    height: "100%",
    color: () => secondary,
  },
);

const responsiveCanvas = ref<InstanceType<typeof ResponsiveCanvas> | null>(null);
const responsiveCanvasOffsetted = ref<InstanceType<typeof ResponsiveCanvas> | null>(null);

const MAX_FREQUENCY_VALUE = 255;

const samples = new Uint8Array(p.analyser.frequencyBinCount);

const draw = (samples: Uint8Array, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  if (p.vertical) {
    const sampleWidth = (canvas.height * 1.0) / p.analyser.frequencyBinCount;

    samples.forEach((value, i) => {
      ctx.fillRect(
        0,
        i * sampleWidth,
        (value / MAX_FREQUENCY_VALUE) * canvas.width,
        sampleWidth - 1,
      );
    });
  } else {
    const sampleWidth = (canvas.width * 1.0) / p.analyser.frequencyBinCount;

    samples.forEach((value, i) => {
      ctx.fillRect(
        i * sampleWidth,
        canvas.height,
        sampleWidth - 1,
        (-value / MAX_FREQUENCY_VALUE) * canvas.height,
      );
    });
  }
};

useAnimate(() => {
  assert(responsiveCanvas.value?.canvas && responsiveCanvas.value.ctx);
  const { canvas, ctx } = responsiveCanvas.value;

  p.analyser.getByteFrequencyData(samples);

  ctx.reset();

  ctx.fillStyle = p.color.toString();

  draw(samples, canvas, ctx);

  const clonedSamples = new Uint8Array(samples);

  setTimeout(() => {
    assert(responsiveCanvasOffsetted.value?.canvas && responsiveCanvasOffsetted.value.ctx);
    const { canvas, ctx } = responsiveCanvasOffsetted.value;

    ctx.reset();
    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.33)`;

    draw(clonedSamples, canvas, ctx);
  }, 500);
});
</script>

<template>
  <div class="frequency-visualiser-container">
    <ResponsiveCanvas ref="responsiveCanvas" :width :height />
    <ResponsiveCanvas ref="responsiveCanvasOffsetted" :width :height />
  </div>
</template>

<style scoped>
.frequency-visualiser-container {
  width: v-bind("p.width");
  height: v-bind("p.height");
  position: relative;

  & > * {
    position: absolute;
  }
}
</style>
