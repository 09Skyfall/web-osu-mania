<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
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

const foreground = ref<InstanceType<typeof ResponsiveCanvas> | null>(null);
const background = ref<InstanceType<typeof ResponsiveCanvas> | null>(null);

const MAX_FREQUENCY_VALUE = 255;

const foregroundSamples = shallowRef(new Uint8Array(p.analyser.frequencyBinCount));

const draw = (
  samples: Uint8Array,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  fillStlye?: string | CanvasGradient | CanvasPattern,
) => {
  ctx.fillStyle = fillStlye ?? ctx.fillStyle;

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

const drawForeground = computed(() => {
  if (!foreground.value?.canvas || !foreground.value?.ctx) return () => undefined;

  const { canvas, ctx } = foreground.value;
  return () => draw(foregroundSamples.value, canvas, ctx, p.color.toString());
});

useAnimate(() => {
  assert(foreground.value?.canvas && foreground.value.ctx);
  const { canvas, ctx } = foreground.value;

  p.analyser.getByteFrequencyData(foregroundSamples.value);

  ctx.reset();

  ctx.fillStyle = p.color.toString();

  draw(foregroundSamples.value, canvas, ctx);

  const backgroundSamples = new Uint8Array(foregroundSamples.value);

  setTimeout(() => {
    assert(background.value?.canvas && background.value.ctx);
    const { canvas, ctx } = background.value;

    ctx.reset();
    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.33)`;

    draw(backgroundSamples, canvas, ctx);
  }, 500);
});
</script>

<template>
  <div class="frequency-visualiser-container">
    <ResponsiveCanvas ref="foreground" :width :height :redraw="drawForeground" style="z-index: 1" />
    <ResponsiveCanvas ref="background" :width :height />
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
