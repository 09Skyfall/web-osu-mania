<script setup lang="ts">
import Column from "../column/Column.vue";
import Judgement from "../judgement/Judgement.vue";
import { computed, onMounted, ref } from "vue";
import Score from "../score/Score.vue";
import { size, sum } from "lodash";
import HealthBar from "../health/HealthBar.vue";
import { assert } from "../../utils/assertions";
import PauseOverlay from "./PauseOverlay.vue";
import { useGamePause } from "./useGamePause";
import { BeatmapLevel } from "../beatmap/store";

const p = defineProps<{ map: BeatmapLevel }>();

const columns = ref<InstanceType<typeof Column>[]>([]);
const audio = ref<HTMLAudioElement | null>(null);

const { paused } = useGamePause(columns, audio);

onMounted(() => {
  assert(audio.value, "Expected audio element to be mounted.");
  audio.value.addEventListener("canplaythrough", () => {
    columns.value.forEach((c) => c.play());
    audio.value!.play();
  });
});

const totalNotes = computed(() => sum(p.map.hitObjects.map(size)));
const hitKeys = ["a", "s", "k", "l"]; // TODO: take from settings store (?)
const cols = computed(() =>
  p.map.hitObjects.map((notes, i) => ({ hitKey: hitKeys[i], notes })),
);
</script>

<template>
  <audio ref="audio" :src="map.audio.source" />

  <div class="field">
    <template v-for="(col, i) of cols" :key="i">
      <Column ref="columns" v-bind="col" />
    </template>

    <HealthBar />

    <Judgement class="judgement" />

    <Score :total-notes="totalNotes" />

    <PauseOverlay :active="paused" />
  </div>
</template>

<style scoped>
.field {
  display: grid;
  grid-auto-columns: 100px;
  grid-auto-flow: column;
  height: 100dvh;

  position: relative;
}
.judgement {
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>
