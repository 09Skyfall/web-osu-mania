<script setup lang="ts">
import { judgementService } from "./JudgementService";
import { Judgement } from "./store";
import { timeoutRef } from "../../composables/timeoutRef";
import { uniqueId } from "lodash";
import { computed } from "vue";

/**
 * TODO: images are not cached and for each new judgement
 * an image is freshly fetched
 */

const currentJudgement = timeoutRef<{ value: Judgement; id: string } | null>(null, 500);

const baseUrl = "../../../assets/judgment-scores";
const src = computed(() => {
  if (currentJudgement.value?.value === "PERFECT") return `${baseUrl}/judgement_perfect.gif`;
  else if (currentJudgement.value)
    return `${baseUrl}/judgement_${currentJudgement.value.value}.png`;
  return null;
});

judgementService.onAdd((j) => (currentJudgement.value = { value: j, id: uniqueId() }));
</script>

<template>
  <Transition name="bounce">
    <img v-if="src" :key="currentJudgement?.id" :src />
  </Transition>
</template>

<style>
.bounce-enter-active {
  animation: bounce-in 150ms ease-out;
}
@keyframes bounce-in {
  0% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
</style>
