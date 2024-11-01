<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { size, sum } from "lodash";
import { useGamePause } from "../resources/field/useGamePause";
import { useAsyncComputed } from "../composables/useAsyncComputed";
import { beatmapDb } from "../resources/beatmap/database";
import { AudioStream } from "../resources/audio/AudioStream";
import { storeToRefs } from "pinia";
import { GAME_STATE, useGameFieldStore } from "../resources/field/store";
import Judgement from "../resources/judgement/Judgement.vue";
import Score from "../resources/score/Score.vue";
import PauseOverlay from "../resources/field/PauseOverlay.vue";
import HealthBar from "../resources/health/HealthBar.vue";
import Field from "../resources/field/Field.vue";
import { nonNull } from "../utils/assertions/nonNull";

const p = defineProps<{ beatmapId: string; levelId: string }>();

const { gameState } = storeToRefs(useGameFieldStore());

useGamePause();

const { value: level } = useAsyncComputed(null, async () => {
  await beatmapDb.open();
  const beatmap = await beatmapDb.getItem("beatmaps", p.beatmapId);
  return nonNull(beatmap.levels.find((level) => level.id === p.levelId));
});

const { value: audioReadableStream } = useAsyncComputed(null, async () => {
  await beatmapDb.open();
  return beatmapDb.getAudioStream(p.beatmapId, 0);
});

const audioStream = ref(new AudioStream());

const field = ref<InstanceType<typeof Field> | null>(null);

const totalNotes = computed(() => sum(level.value?.hitObjects.map(size)));

watch(gameState, (state) => {
  switch (state) {
    case GAME_STATE.PAUSED: {
      nonNull(field.value).pause();
      audioStream.value.pause();
      break;
    }
    case GAME_STATE.RUNNING: {
      nonNull(field.value).resume();
      audioStream.value.resume();
      break;
    }
  }
});

watchEffect(() => {
  // TODO: non mi piace molto come check
  if (!level.value || !audioReadableStream.value || !field.value) return;

  audioStream.value.setReader(audioReadableStream.value);
  audioStream.value.stream();
  // TODO: Account for output latency
  field.value.play();
});
</script>

<template>
  <div class="wrapper" v-if="level">
    <Field ref="field" :level="level" />

    <HealthBar />

    <Judgement class="judgement" />

    <Score :total-notes="totalNotes" />

    <PauseOverlay :active="gameState === GAME_STATE.PAUSED" />
  </div>
</template>

<style scoped>
.wrapper {
  display: grid;
  grid-auto-columns: max-content;
  grid-auto-flow: column;
  height: 100dvh;
}

.judgement {
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>
