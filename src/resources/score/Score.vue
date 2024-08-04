<script setup lang="ts">
import { judgementService } from '../judgement/JudgementService';
import { useScore } from './useScore';

const p = defineProps<{ totalNotes: number }>()

const { score, update: updateScore } = useScore(() => p.totalNotes)

judgementService.onAdd(updateScore)
</script>

<template>
  <span class="score">{{ Math.round(score) }}</span>
</template>

<style scoped>
.score {
  font-size: 2rem;
  color: white;
}
</style>