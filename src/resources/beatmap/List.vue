<script setup lang="ts">
import List from "../../components/List.vue";
import { assert } from "../../utils/assertions";
import { AudioManager } from "../audio/AudioManager";
import { toArray } from "../../utils/toArray";
import { beatmapDb } from "./database";
import { Beatmap } from "./store";
import { onBeforeMount, ref, watch } from "vue";

const beatmaps = ref<Beatmap<string>[]>([]);
const cancelStream = ref<() => Promise<void>>(() => Promise.resolve());

const beatmapSelected = ref<string | null>(null);
const levelSelected = ref<string | null>(null);

const isBeatmapSelected = (id: string) => beatmapSelected.value === id;
const isLevelSelected = (id: string) => levelSelected.value === id;

const onSelectBeatmap = (e: Event, id: string) => {
  beatmapSelected.value = id;
  assert(e.target instanceof HTMLElement);
  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
};

onBeforeMount(async () => {
  await beatmapDb.open();

  beatmaps.value = toArray(await beatmapDb.getItem("beatmaps")).map((b) => ({
    ...b,
    audioSource: URL.createObjectURL(b.audioSource),
    imageSource: b.imageSource ? URL.createObjectURL(b.imageSource) : undefined,
  }));
});

watch(beatmapSelected, async (id, oldId) => {
  if (!id || id === oldId) return;

  const found = beatmaps.value.find((b) => b.id === id);
  assert(found);

  levelSelected.value = found.levels[0].id;

  const rs = await beatmapDb.getAudioStream(id, found.levels[0].audioPreviewTime /* ms */ / 1000);
  await cancelStream.value();
  cancelStream.value = AudioManager.stream(rs);
});
</script>

<template>
  <List :items="beatmaps" bouncy parabolic style="height: 80dvh">
    <template #item="{ item: beatmap }">
      <li
        class="list-item beatmap-list-item"
        :class="{ selected: isBeatmapSelected(beatmap.id) }"
        :style="`--background-image-src: url('${beatmap.imageSource}')`"
        :p-multiplier="isBeatmapSelected(beatmap.id) ? 1.1 : 1"
        @click="onSelectBeatmap($event, beatmap.id)"
      >
        {{ beatmap.id }}
      </li>
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
  margin: 8px 0;
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
