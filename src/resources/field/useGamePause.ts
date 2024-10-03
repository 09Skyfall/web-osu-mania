import { ref, Ref } from "vue";
import { useKey } from "../../composables/useKey";
import { assert } from "../../utils/assertions";
import Column from "../column/Column.vue";
import { useEventListener } from "../../composables/useEventListener";

export const useGamePause = (
  columns: Ref<InstanceType<typeof Column>[]>,
  audio: Ref<HTMLAudioElement | null>,
) => {
  const paused = ref(false);

  const pause = () => {
    assert(audio.value, "Expected audio element to be mounted.");
    paused.value = true;
    audio.value.pause();
    columns.value.forEach((c) => c.pause());
  };

  const resume = () => {
    assert(audio.value, "Expected audio element to be mounted.");
    paused.value = false;
    audio.value.play();
    columns.value.forEach((c) => c.resume());
  };

  useKey("Escape", {
    on_key_down: () => {
      if (paused.value) resume();
      else pause();
    },
  });

  useEventListener(document, "visibilitychange", () => {
    if (document.hidden) pause();
  });

  return { paused, pause, resume };
};
