import { useKey } from "../../composables/useKey";
import { useEventListener } from "../../composables/useEventListener";
import { GAME_STATE, useGameFieldStore } from "./store";
import { storeToRefs } from "pinia";

export const useGamePause = () => {
  const { gameState } = storeToRefs(useGameFieldStore());

  const pause = () => {
    if (gameState.value !== GAME_STATE.RUNNING) return;
    gameState.value = GAME_STATE.PAUSED;
  };

  const resume = () => {
    gameState.value = GAME_STATE.RUNNING;
  };

  useKey("Escape", {
    on_key_down: () => {
      if (gameState.value === GAME_STATE.PAUSED) resume();
      else pause();
    },
  });

  useEventListener(document, "visibilitychange", () => {
    if (document.hidden) pause();
  });
};
