<script setup lang="ts">
import { Beatmap } from "./store";

defineProps<{
  selected: boolean;
  beatmap: Beatmap<string>;
}>();
</script>

<template>
  <li
    class="beatmap-list-item"
    :style="`--background-image-src: url('${beatmap.levels[0].imageSource}')`"
  >
    {{ beatmap.id }}
  </li>
</template>

<style scoped>
.beatmap-list-item {
  padding: 1rem;
  height: 100px;
  background-image: var(--background-image-src);
  box-shadow: white 0 0 8px 0;
  border: 1px solid white;

  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  cursor: pointer;
}
</style>
