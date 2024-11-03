<script setup lang="ts">
import { computed, ref } from "vue";
import { useAnimate } from "../../src/composables/useAnimate";
import { mean, range } from "lodash";
import { assert } from "../../src/utils/assertions/assert";

const canvas = ref<HTMLCanvasElement[]>([]);
const ctxs = computed(() => canvas.value.map((canvas) => canvas.getContext("2d")));

type Rect = { x: number; y: number; w: number; h: number };

const rects = ref<Rect[]>([]);

const timeSamples = ref<number[]>([]);
let _timeStart = 0;

const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 400;

useAnimate(() => {
  _timeStart = performance.now();

  clearingStrategies.clearRect();

  const _timeEnd = performance.now() - _timeStart;

  if (timeSamples.value.length >= 10000) {
    timeSamples.value.unshift(_timeEnd);
    timeSamples.value.pop();
  } else {
    timeSamples.value.push(_timeEnd);
  }

  rects.value = [];

  range(5).forEach(spawnItem);

  rects.value.forEach(({ x, y, w, h }) =>
    ctxs.value.forEach((ctx) => {
      assert(ctx);

      ctx.fillStyle = "red";
      ctx.fillRect(x, y, w, h);
    }),
  );
});

const spawnItem = () => {
  const x = Math.round(Math.random() * CANVAS_WIDTH);
  const y = Math.round(Math.random() * CANVAS_HEIGHT);

  rects.value.push({ x, y, w: 100, h: 100 });
};

const clearingStrategies = {
  reset: () => {
    ctxs.value.forEach((ctx) => {
      assert(ctx);
      ctx.reset();
    });
  },

  fillRect: () => {
    rects.value.forEach(({ x, y, w, h }) =>
      ctxs.value.forEach((ctx) => {
        assert(ctx);
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, w, h);
      }),
    );
  },

  clearRect: () => {
    rects.value.forEach(({ x, y, w, h }) =>
      ctxs.value.forEach((ctx) => {
        assert(ctx);
        ctx.clearRect(x, y, w, h);
      }),
    );
  },

  clearAll: () => {
    ctxs.value.forEach((ctx) => {
      assert(ctx);
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    });
  },
};
</script>

<template>
  <div class="layout">
    <div class="canvas-grid">
      <canvas
        v-for="i of [1, 2, 3, 4]"
        :key="i"
        ref="canvas"
        :width="CANVAS_WIDTH"
        :height="CANVAS_HEIGHT"
      />
      <span>{{ mean(timeSamples).toFixed(3) }}ms</span>
      <span>{{ timeSamples.length }}</span>
    </div>
  </div>
</template>

<style scoped>
.layout {
  margin: 1rem;
  display: flex;
  gap: 2rem;
}
.canvas-grid {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: auto auto;
  gap: 1rem;
}
canvas {
  border: 1px solid red;
}
span {
  font-size: 2rem;
}
</style>
