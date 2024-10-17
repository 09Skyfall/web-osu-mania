<script setup lang="ts">
import { shallowRef } from "vue";

import FpsCounter from "./components/FpsCounter.vue";
import Field from "./resources/field/Field.vue";
import { Beatmap, BeatmapLevel, oszToJson } from "./resources/beatmap/store";
import { beatmapDb } from "./resources/beatmap/database";
import BeatmapList from "./resources/beatmap/List.vue";
import { toArray } from "./utils/toArray";
import { AudioManager } from "./utils/classes/AudioManager";

const level = shallowRef<BeatmapLevel | null>(null);
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
  maps.value = toArray(await beatmapDb.getItem("beatmaps")).map((b) => ({
    ...b,
    audioSource: URL.createObjectURL(b.audioSource),
    imageSource: b.imageSource ? URL.createObjectURL(b.imageSource) : undefined,
  }));

  console.log(maps.value);

  const rs = await beatmapDb.getAudioStream(maps.value[2].id);
  // AudioManager.stream(rs);
})();
</script>

<template>
  <div style="display: flex">
    <input type="file" @change="onSelectFile" />
    <!-- <field v-if="level" :level="level" :song="" /> -->
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
