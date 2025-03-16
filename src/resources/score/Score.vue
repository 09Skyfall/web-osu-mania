<script setup lang="ts">
import { watch } from "vue";
import { judgementService } from "../judgement/JudgementService";
import { useScore } from "./useScore";

const emit = defineEmits<{ "update:score": [score: number] }>();

const p = defineProps<{ totalNotes: number }>();

const { score, update: updateScore } = useScore(() => p.totalNotes);

judgementService.subscribe("add", ({ judgement }) => updateScore(judgement));

watch(score, (_score) => emit("update:score", _score));
</script>

<template>
  <span>{{ Math.round(score) }}</span>
</template>
