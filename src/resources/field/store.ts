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

const MAX_DURATION = 11485;

export const useGameFieldStore = defineStore("game-field", () => {
  const { borderBoxBlock: screenHeight } = useResize(window.document.documentElement);

  const { scrollSpeed, hitKeyHeight, columnWidth } = storeToRefs(useSettingsStore());

  const HIT_KEY_HEIGHT = computed(() => hitKeyHeight.value); // px
  const COL_HEIGHT = computed(() => screenHeight.value - HIT_KEY_HEIGHT.value); // px
  const COL_WIDTH = computed(() => columnWidth.value); // px
  const DURATION = computed(() => MAX_DURATION / scrollSpeed.value); // ms
  const VELOCITY = computed(() => COL_HEIGHT.value / DURATION.value); // ms

  const gameState = ref<GAME_STATE>(GAME_STATE.RUNNING);

  return {
    HIT_KEY_HEIGHT,
    COL_HEIGHT,
    COL_WIDTH,
    DURATION,
    VELOCITY,
    gameState,
  };
});
