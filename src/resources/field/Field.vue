<script setup lang="ts">
import Column from "../column/Column.vue";
import Judgement from "../judgement/Judgement.vue";
import { type ColumnProps } from "../column/store";
import { computed, onMounted, ref, watch } from "vue";
import { useGameFieldStore } from "./store";
import { storeToRefs } from "pinia";
import Score from "../score/Score.vue";
import { sum } from "lodash";
import HealthBar from "../health/HealthBar.vue";
import { assert } from "../../utils/assert";
import PauseOverlay from "./PauseOverlay.vue";
import { useGamePause } from "./useGamePause";

// TODO: spostare
type Map = {
  cols: ColumnProps[];
  song?: string;
};

const p = defineProps<{ map: Map }>();

const { DURATION } = storeToRefs(useGameFieldStore());

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

let startDelay = 0; // ms
watch(
  () => p.map.cols,
  (cols) => {
    if (cols[0].notes.length) {
      const firstNotes = cols.map((col) => col.notes[0]);
      startDelay = Math.max(
        0,
        ...firstNotes.map((note) => DURATION.value - note.hit_t),
      );
    }
  },
  { deep: true },
);

const totalNotes = computed(() => sum(p.map.cols.map((c) => c.notes.length)));
</script>

<template>
  <audio ref="audio" :src="map.song" />
  <div class="field">
    <template v-for="(col, i) of map.cols" :key="i">
      <Column ref="columns" v-bind="col" :start-delay />
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
