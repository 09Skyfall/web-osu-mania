<script setup lang="ts">
import { ref, onBeforeUnmount, watch } from "vue";
import { AudioStream } from "../resources/audio/AudioStream";
import FrequencyVisualizer from "../resources/audio/FrequencyVisualizer.vue";
import { beatmapDb } from "../resources/beatmap/database";
import ImportButton from "../resources/beatmap/ImportButton.vue";
import List from "../resources/beatmap/List.vue";
import { Beatmap, BeatmapLevel } from "../resources/beatmap/store";
import { router, ROUTE } from "../plugins/router";

const beatmapSelected = ref<Beatmap<string> | null>(null);
const levelSelected = ref<BeatmapLevel | null>(null);

const audioStream = ref(new AudioStream());

const goToGameField = (beatmapId: string, levelId: string) => {
  return router.push({
    name: ROUTE.GAME_FIELD,
    params: { beatmapId, levelId },
  });
};

onBeforeUnmount(() => {
  if (audioStream.value.hasReader()) audioStream.value.stop();
});

watch(beatmapSelected, async (selected) => {
  if (!selected?.id) return;

  levelSelected.value = selected.levels[0];

  const rs = await beatmapDb.getAudioStream(
    selected.id,
    levelSelected.value.audioPreviewTime /* ms */ / 1000,
  );

  if (audioStream.value.hasReader()) await audioStream.value.stop();
  audioStream.value = new AudioStream({ stream: rs });
  audioStream.value.stream();
});
</script>

<template>
  <List
    v-model:selected-beatmap="beatmapSelected"
    v-model:selected-level="levelSelected"
    @select:level="goToGameField"
  />

  <ImportButton class="home-import-button" />
</template>

<style scoped>
.home-import-button {
  position: absolute;
  right: 0;
  bottom: 5dvh;
}
</style>
