<script lang="ts" setup>
import { ref } from "vue";
import { judgementService } from "../judgement/JudgementService";
import { getJudgementImgSrc, JUDGEMENT } from "../judgement/store";
import Overlay from "../../components/Overlay.vue";
import RetryButton from "./RetryButton.vue";
import QuitButton from "./QuitButton.vue";
import { padStart } from "lodash";

defineProps<{ active: boolean; score: number }>();

const judgements = ref({
  [JUDGEMENT.PERFECT]: 0,
  [JUDGEMENT.GREAT]: 0,
  [JUDGEMENT.GOOD]: 0,
  [JUDGEMENT.OK]: 0,
  [JUDGEMENT.MEH]: 0,
  [JUDGEMENT.MISS]: 0,
});

judgementService.subscribe("add", ({ judgement }) => judgements.value[judgement]++);
</script>

<template>
  <Overlay :active>
    <div class="game-finish-container">
      <div class="game-finish-background">
        <p>Score: {{ padStart(Math.round(score).toString(), 7, "0") }}</p>

        <div class="judgement-scores-container">
          <div class="single-judgement-score">
            <img height="50px" :src="getJudgementImgSrc(JUDGEMENT.PERFECT)" />
            <span>{{ judgements[JUDGEMENT.PERFECT] }}</span>
          </div>

          <div class="single-judgement-score">
            <img height="50px" :src="getJudgementImgSrc(JUDGEMENT.GREAT)" />
            <span>{{ judgements[JUDGEMENT.GREAT] }}</span>
          </div>

          <div class="single-judgement-score">
            <img height="50px" :src="getJudgementImgSrc(JUDGEMENT.GOOD)" />
            <span>{{ judgements[JUDGEMENT.GOOD] }}</span>
          </div>

          <div class="single-judgement-score">
            <img height="50px" :src="getJudgementImgSrc(JUDGEMENT.OK)" />
            <span>{{ judgements[JUDGEMENT.OK] }}</span>
          </div>

          <div class="single-judgement-score">
            <img height="50px" :src="getJudgementImgSrc(JUDGEMENT.MEH)" />
            <span>{{ judgements[JUDGEMENT.MEH] }}</span>
          </div>

          <div class="single-judgement-score">
            <img height="50px" :src="getJudgementImgSrc(JUDGEMENT.MISS)" />
            <span>{{ judgements[JUDGEMENT.MISS] }}</span>
          </div>
        </div>

        <div class="game-finish-buttons">
          <RetryButton width="350px" height="50px" />
          <QuitButton width="350px" height="50px" />
        </div>
      </div>
    </div>
  </Overlay>
</template>

<style scoped>
p {
  font-size: 5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.33rem;
  margin: 0.3em;
}

.game-finish-container {
  display: grid;
  align-content: center;
  height: 100dvh;
}

.game-finish-background {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  width: 100%;
  padding: 1rem 0;

  background-color: #292524;
}

.judgement-scores-container {
  display: flex;
  gap: 1rem;
  margin: 3rem 0;
}

.single-judgement-score {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1c1917;
  border-radius: 8px;

  span {
    padding: 1rem;
    font-size: 2rem;
  }
}

.game-finish-buttons {
  display: flex;
  background-color: #1c1917;
  border-radius: 8px;
  padding: 1rem;
  clip-path: polygon(30px 0%, 100% 0%, calc(100% - 30px) 100%, 0% 100%);
}
</style>
