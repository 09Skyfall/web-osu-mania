<script setup lang="ts">
import Overlay from "../../components/Overlay.vue";
import RetryButton from "./RetryButton.vue";
import QuitButton from "./QuitButton.vue";
import ButtonsContainer from "./ButtonsContainer.vue";

defineProps<{ active: boolean }>();
</script>

<template>
  <Overlay :active>
    <div class="game-over-container">
      <p class="title">Game over</p>

      <ButtonsContainer>
        <RetryButton glow />
        <QuitButton glow />
      </ButtonsContainer>
    </div>
  </Overlay>
</template>

<style scoped>
.game-over-container {
  display: grid;
  align-content: center;
  height: 100dvh;

  .title {
    font-size: 5rem;
    font-weight: 800;
    font-variant: all-small-caps;
    color: var(--error);
    letter-spacing: 0.33rem;
    text-align: center;
  }
}
</style>
