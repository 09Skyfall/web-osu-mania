import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useResize } from "../../composables/useResize";
import { useSettingsStore } from "../settings/store";

export enum GAME_STATE {
  PAUSED = "PAUSED",
  RUNNING = "RUNNING",
  GAME_OVER = "GAME_OVER",
  GAME_FINISH = "GAME_FINISH",
}

export const useGameFieldStore = defineStore("game-field", () => {
  const { borderBoxBlock: screenHeight } = useResize(window.document.documentElement);

  const { scrollSpeed } = storeToRefs(useSettingsStore());

  const HIT_KEY_HEIGHT = ref(150); // px
  const COL_HEIGHT = computed(() => screenHeight.value - HIT_KEY_HEIGHT.value); // px
  const COL_WIDTH = ref(100); // px
  const DURATION = computed(() => COL_HEIGHT.value / scrollSpeed.value); // ms

  const gameState = ref<GAME_STATE>(GAME_STATE.RUNNING);

  return {
    HIT_KEY_HEIGHT,
    COL_HEIGHT,
    COL_WIDTH,
    DURATION,
    gameState,
  };
});
