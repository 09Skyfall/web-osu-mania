<script setup lang="ts">
import { shallowRef } from "vue";

import FpsCounter from "./components/FpsCounter.vue";
import Field from "./resources/field/Field.vue";
import { Beatmap, BeatmapLevel, oszToJson } from "./resources/beatmap/store";
import { beatmapDb } from "./resources/beatmap/database";
import BeatmapList from "./resources/beatmap/List.vue";

const map = shallowRef<BeatmapLevel<string> | null>(null);
const maps = shallowRef<Beatmap<string>[]>([]);

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  if (!files) return;

  const map = await oszToJson(files[0]);
  await beatmapDb.open();
  await beatmapDb.addItem(map);
};

(async () => {
  await beatmapDb.open();
  maps.value = (await beatmapDb.getItem()).map((b) => ({
    id: b.id,
    levels: b.levels.map((l) => ({
      ...l,
      audio: {
        ...l.audio,
        source: URL.createObjectURL(l.audio.source),
      },
      imageSource: l.imageSource ? URL.createObjectURL(l.imageSource) : undefined,
    })),
  }));
})();
</script>

<template>
  <div style="display: flex">
    <input type="file" @change="onSelectFile" />
    <field v-if="map" :map />
  </div>

  <BeatmapList :beatmaps="maps" />

  <fps-counter />
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background-color: rgba(0, 0, 0, 0.85);
}
</style>
