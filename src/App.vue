<script setup lang="ts">
import { shallowRef } from "vue";

import FpsCounter from "./components/FpsCounter.vue";
import Field from "./resources/field/Field.vue";
import { BeatmapLevel, oszToJson } from "./resources/beatmap/store";

const map = shallowRef<BeatmapLevel | null>(null);

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  if (!files) return;

  const { levels } = await oszToJson(files[0]);
  map.value = levels[0];
};
</script>

<template>
  <div style="display: flex">
    <input type="file" @change="onSelectFile" />
    <field v-if="map" :map />
  </div>

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
