<script setup lang="ts">
import FpsCounter from "./components/FpsCounter.vue";
import { oszToJson } from "./resources/beatmap/store";
import { beatmapDb } from "./resources/beatmap/database";
import BeatmapList from "./resources/beatmap/List.vue";

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  if (!files) return;

  const map = await oszToJson(files[0]);
  await beatmapDb.open();
  await beatmapDb.addItem(map);
};
</script>

<template>
  <div style="display: flex">
    <input type="file" @change="onSelectFile" />
    <!-- <field v-if="level" :level="level" :song="" /> -->
  </div>

  <BeatmapList />

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
