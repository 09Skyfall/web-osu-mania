<script setup lang="ts">
import { useCanvas } from "../../composables/useCanvas";
import { judgementService } from "./JudgementService";
import { inRange, last } from "lodash";
import { JUDGEMENT, JUDGEMENT_WINDOWS, judgementColors } from "./store";
import { assert } from "../../utils/assertions/assert";
import { useAnimate } from "../../composables/useAnimate";
import { computed, onBeforeUnmount, ref } from "vue";
import Icon from "../../components/Icon.vue";

const p = withDefaults(defineProps<{ width?: number; height?: number }>(), {
  width: 35,
  height: 350,
});

const { canvas, ctx } = useCanvas({ alpha: true });

const MAX_LINES = 75;
const lines = ref<number[]>([]);

const unsubscribe = judgementService.subscribe("add", ({ judgement, note_hit_t, timestamp }) => {
  if (judgement === "MISS") return;

  assert(
    inRange(timestamp - note_hit_t, -JUDGEMENT_WINDOWS["MISS"], JUDGEMENT_WINDOWS["MISS"] + 1),
  );

  lines.value.push((p.height * (timestamp - note_hit_t)) / JUDGEMENT_WINDOWS["MISS"]);
  if (lines.value.length >= MAX_LINES) lines.value.shift();
});

useAnimate(() => {
  assert(ctx.value);
  ctx.value.reset();
  ctx.value.fillStyle = "white";
  for (const line of lines.value) ctx.value.fillRect(0, p.height / 2 + line, p.width, 1);
});

const background = computed(() => {
  const gradients: string[] = [];
  const maxValue = JUDGEMENT_WINDOWS["MISS"];

  Object.values(JUDGEMENT).forEach((jw) => {
    gradients.push(
      `${judgementColors[jw].toString()} ${50 + (JUDGEMENT_WINDOWS[jw] * 100) / maxValue / 2}%`,
    );
    gradients.unshift(
      `${judgementColors[jw].toString()} ${100 - (50 + (JUDGEMENT_WINDOWS[jw] * 100) / maxValue / 2)}%`,
    );
  });

  return `linear-gradient(0deg, ${gradients.join(", ")})`;
});

const lastHitPosition = computed<string>(() => `${last(lines.value) ?? 0}px`);

onBeforeUnmount(unsubscribe);
</script>

<template>
  <div class="__hit_time_visualizer">
    <Icon
      icon="chevron-right"
      size="20"
      stroke-width="5"
      class="__hit_time_visualizer-last-hit-hint"
    />

    <canvas ref="canvas" :width="width - 15" :height />
  </div>
</template>

<style scoped>
.__hit_time_visualizer {
  display: flex;
  width: v-bind("`${width}px`");
  height: v-bind("`${height}px`");
  margin: 32px;
  position: relative;
  top: 50%;
  translate: 0 -75%;

  .__hit_time_visualizer-last-hit-hint {
    position: relative;
    top: calc(50% + v-bind("lastHitPosition"));
    translate: 0 -50%;
    transition: top 100ms;
  }

  canvas {
    width: v-bind("`${width - 15}px`");
    height: v-bind("`${height}px`");
    background: v-bind("background");
    border-radius: 8px;
  }
}
</style>
