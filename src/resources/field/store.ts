import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useResize } from "../../composables/useResize";

export const useGameFieldStore = defineStore("game-field", () => {
  const { borderBoxBlock: screenHeight } = useResize(window.document.documentElement);

  const SCROLL_SPEED = ref(1.5); // px/ms
  const HIT_KEY_HEIGHT = ref(100); // px
  const COL_HEIGHT = computed(() => screenHeight.value - HIT_KEY_HEIGHT.value); // px
  const COL_WIDTH = ref(100); // px
  const DURATION = computed(() => COL_HEIGHT.value / SCROLL_SPEED.value); // ms

  return {
    SCROLL_SPEED,
    HIT_KEY_HEIGHT,
    COL_HEIGHT,
    COL_WIDTH,
    DURATION,
  };
});
