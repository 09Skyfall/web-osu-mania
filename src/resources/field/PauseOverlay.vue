<script setup lang="ts">
import Overlay from "../../components/Overlay.vue";
import RetryButton from "./RetryButton.vue";
import QuitButton from "./QuitButton.vue";
import ButtonsContainer from "./ButtonsContainer.vue";
import ResumeButton from "./ResumeButton.vue";

defineProps<{ active: boolean }>();
</script>

<template>
  <Overlay :active>
    <div class="paused-container">
      <p class="title">Paused</p>

      <ButtonsContainer>
        <ResumeButton glow />
        <RetryButton glow />
        <QuitButton glow />
      </ButtonsContainer>
    </div>
  </Overlay>
</template>

<style scoped>
.paused-container {
  display: grid;
  align-content: center;
  height: 100dvh;

  .title {
    font-size: 5rem;
    font-weight: 800;
    font-variant: all-small-caps;
    color: var(--warning);
    letter-spacing: 0.33rem;
    text-align: center;
  }
}
</style>
