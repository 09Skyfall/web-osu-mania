import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useResize } from "../../composables/useResize";

export enum MANIA_KEY_MODE {
  "4K" = "4K",
  "7K" = "7K",
}

export enum GAME_STATE {
  PAUSED = "PAUSED",
  RUNNING = "RUNNING",
  GAME_OVER = "GAME_OVER",
}

export const useGameFieldStore = defineStore("game-field", () => {
  const { borderBoxBlock: screenHeight } = useResize(window.document.documentElement);

  const SCROLL_SPEED = ref(1.5); // px/ms
  const HIT_KEY_HEIGHT = ref(100); // px
  const COL_HEIGHT = computed(() => screenHeight.value - HIT_KEY_HEIGHT.value); // px
  const COL_WIDTH = ref(100); // px
  const DURATION = computed(() => COL_HEIGHT.value / SCROLL_SPEED.value); // ms

  const gameState = ref<GAME_STATE>(GAME_STATE.RUNNING);

  const keyBindings = new Map([
    [MANIA_KEY_MODE["4K"], ["a", "s", "k", "l"]],
    [MANIA_KEY_MODE["7K"], ["a", "s", "d", " ", "j", "k", "l"]],
  ]);

  return {
    SCROLL_SPEED,
    HIT_KEY_HEIGHT,
    COL_HEIGHT,
    COL_WIDTH,
    DURATION,
    keyBindings,
    gameState,
  };
});
