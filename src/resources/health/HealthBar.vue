<script setup lang="ts">
import { computed, watch } from "vue";
import Bar from "../../components/Bar.vue";
import { RGB } from "../colors/RGB";
import { judgementService } from "../judgement/JudgementService";
import { clampRef } from "../../composables/clampRef";

const emit = defineEmits<{ "update:health": [health: number] }>();

const health = clampRef(1, { min: 0, max: 1 });

const lowHealthColor = new RGB(213, 0, 0);
const highHealthColor = new RGB(56, 142, 60);
const barColor = computed(() =>
  RGB.interpolate(lowHealthColor, highHealthColor, health.value).toString(),
);

judgementService.subscribe("add", ({ judgement }) => {
  switch (judgement) {
    case "PERFECT":
      health.value += health.value * 0.25;
      break;
    case "GREAT":
      health.value += health.value * 0.1;
      break;
    case "GOOD":
      health.value += health.value * 0.05;
      break;
    case "OK":
      break;
    case "MEH":
      health.value -= 0.025;
      break;
    case "MISS":
      health.value -= 0.05;
      break;
  }
});

watch(health, (health) => emit("update:health", health));
</script>

<template>
  <div class="health-bar">
    <Bar v-model="health" vertical :color="barColor" />
  </div>
</template>

<style scoped>
.health-bar {
  padding: 1rem;
}
</style>
