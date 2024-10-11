<script setup lang="ts">
import List from "../../components/List.vue";
import { Beatmap } from "./store";
import { ref, watch } from "vue";

const p = defineProps<{ beatmaps: Beatmap<string>[] }>();

const beatmapSelected = ref<string | null>(null);
const levelSelected = ref<string | null>(null);

const isBeatmapSelected = (id: string) => beatmapSelected.value === id;
const isLevelSelected = (id: string) => levelSelected.value === id;

watch(beatmapSelected, (id) => {
  if (!id) return;
  const found = p.beatmaps.find((b) => b.id === id);
  if (!found) return;
  levelSelected.value = found.levels[0].id;
});
</script>

<template>
  <List :items="beatmaps" bouncy parabolic style="height: 80dvh">
    <template #item="{ item: beatmap }">
      <li
        class="list-item beatmap-list-item"
        :class="{ selected: isBeatmapSelected(beatmap.id) }"
        :style="`--background-image-src: url('${beatmap.levels[0].imageSource}')`"
        :p-multiplier="isBeatmapSelected(beatmap.id) ? 1.1 : 1"
        @click="beatmapSelected = beatmap.id"
      >
        {{ beatmap.id }}
      </li>
      <!-- TODO: when selecting beatmap should always put it on the center
          if scrolling up, sould overshoot by levels_n * LEVEL_HEIGHT, otherwise not.
        -->
      <!-- todo: unfold animation -->
      <template v-if="isBeatmapSelected(beatmap.id)">
        <li
          v-for="(level, i) of beatmap.levels"
          :key="i"
          class="list-item beatmap-level-list-item"
          :p-multiplier="isLevelSelected(level.id) ? 1.05 : 1"
          :class="{ selected: isLevelSelected(level.id) }"
          @click="levelSelected = level.id"
        >
          {{ level.OverallDifficulty }} {{ level.id }} {{ levelSelected }}
        </li>
      </template>
    </template>
  </List>
</template>

<style scoped>
.list-item {
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: black 2px 2px 8px 0;
  transition:
    margin 150ms,
    opacity 150ms;
}

.list-item.selected {
  box-shadow: white 0 0 8px 0;
  border: 1px solid white;
  margin-top: 8px;
  position: relative;
}

.list-item:hover {
  opacity: 0.8;
}

.beatmap-list-item {
  padding: 1rem;
  height: 100px;
  background-image: var(--background-image-src);
  transform: scaleY(1.05);

  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.beatmap-level-list-item {
  background-color: grey;
  height: 50px;
  margin: 4px 0;
}
</style>
