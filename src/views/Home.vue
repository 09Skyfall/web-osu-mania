<script setup lang="ts">
import { ref, onBeforeUnmount, watch, provide } from "vue";
import { beatmapDb } from "../resources/beatmap/database";
import List from "../resources/beatmap/List.vue";
import { Beatmap, BeatmapLevel } from "../resources/beatmap/store";
import { router, ROUTE } from "../plugins/router";
import Sidebar from "../components/Sidebar.vue";
import BackgroundImage from "../resources/beatmap/BackgroundImage.vue";
import { RouterView } from "vue-router";
import Overlay from "../components/Overlay.vue";
import { audioManager } from "../resources/audio/AudioManager";

const beatmapSelected = ref<Beatmap<string> | null>(null);
const levelSelected = ref<BeatmapLevel | null>(null);

const audioStream = ref(audioManager.createStream());

provide("audioStream", audioStream);

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
  audioStream.value = audioManager.createStream({ stream: rs });
  audioStream.value.stream();
});
</script>

<template>
  <BackgroundImage :src="beatmapSelected?.imageSource">
    <List
      v-model:selected-beatmap="beatmapSelected"
      v-model:selected-level="levelSelected"
      @select:level="goToGameField"
    />

    <Sidebar />

    <RouterView v-slot="{ Component }">
      <Overlay :active="Boolean(Component)">
        <Component :is="Component" />
      </Overlay>
    </RouterView>
  </BackgroundImage>
</template>
