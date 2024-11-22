<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import { size, sum } from "lodash";
import { useGamePause } from "../resources/field/useGamePause";
import { useAsyncComputed } from "../composables/useAsyncComputed";
import { beatmapDb } from "../resources/beatmap/database";
import { storeToRefs } from "pinia";
import { GAME_STATE, useGameFieldStore } from "../resources/field/store";
import Judgement from "../resources/judgement/Judgement.vue";
import Score from "../resources/score/Score.vue";
import PauseOverlay from "../resources/field/PauseOverlay.vue";
import HealthBar from "../resources/health/HealthBar.vue";
import Field from "../resources/field/Field.vue";
import { nonNull } from "../utils/assertions/nonNull";
import GameOverOverlay from "../resources/field/GameOverOverlay.vue";
import { audioManager } from "../resources/audio/AudioManager";
import BackgroundImage from "../resources/beatmap/BackgroundImage.vue";

const p = defineProps<{ beatmapId: string; levelId: string }>();

const { gameState } = storeToRefs(useGameFieldStore());

gameState.value = GAME_STATE.RUNNING;

useGamePause();

const { value: level } = useAsyncComputed(null, async () => {
  await beatmapDb.open();
  const beatmap = await beatmapDb.getItem("beatmaps", p.beatmapId);
  const level = nonNull(beatmap.levels.find((level) => level.id === p.levelId));

  return {
    ...level,
    imageSource: beatmap.imageSource ? URL.createObjectURL(beatmap.imageSource) : undefined,
  };
});

const { value: audioReadableStream } = useAsyncComputed(null, async () => {
  await beatmapDb.open();
  return beatmapDb.getAudioStream(p.beatmapId, 0);
});

const audioStream = ref(audioManager.createStream());

const field = ref<InstanceType<typeof Field> | null>(null);

const totalNotes = computed(() => sum(level.value?.hitObjects.map(size)));

const pause = () => {
  nonNull(field.value).pause();
  audioStream.value.pause();
};

const resume = () => {
  nonNull(field.value).resume();
  audioStream.value.resume();
};

const onUpdateHealth = (health: number) => {
  if (health > 0) return;

  gameState.value = GAME_STATE.GAME_OVER;
  onGameOver();
};

const onGameOver = pause;

watch(gameState, (state) => {
  switch (state) {
    case GAME_STATE.PAUSED:
      return pause();
    case GAME_STATE.RUNNING:
      return resume();
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
  <BackgroundImage :src="level?.imageSource">
    <div v-if="level" class="container">
    <Field ref="field" :level="level" />
      <Judgement class="judgement" />
    <HealthBar @update:health="onUpdateHealth" />
    </div>

    <Score class="score" :total-notes="totalNotes" />

    <PauseOverlay :active="gameState === GAME_STATE.PAUSED" />

    <GameOverOverlay :active="gameState === GAME_STATE.GAME_OVER" />
  </BackgroundImage>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
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

.score {
  font-size: 2rem;
  position: absolute;
  top: 0;
  right: 0;
  margin: 0.5rem;
}
</style>
