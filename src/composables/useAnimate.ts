import { onMounted, ref } from "vue";
import { assert } from "../utils/assert";

export type AnimateFunction = (delta_t: number) => void;
export type UseAnimateOptions = { animateOnMount?: boolean };

export const useAnimate = (
  cb: AnimateFunction,
  { animateOnMount = true }: UseAnimateOptions = {},
) => {
  const delta_t = ref(0);
  const last_timestamp = ref<number | null>(null);
  const paused = ref(false);
  const animation_id = ref<number | null>(null);

  const _animate = (timestamp: number) => {
    if (!last_timestamp.value) last_timestamp.value = timestamp;
    delta_t.value = timestamp - last_timestamp.value;
    last_timestamp.value = timestamp;

    if (!paused.value) cb(delta_t.value);

    requestAnimationFrame(_animate);
  };

  const play = () => (animation_id.value = requestAnimationFrame(_animate));

  const pause = () => {
    paused.value = true;
  };

  const resume = () => {
    paused.value = false;
  };

  const stop = () => {
    assert(animation_id.value, "Cannot stop animation before its start");
    cancelAnimationFrame(animation_id.value);
  };

  // TODO: does the callback stop running after unmount? i think not :(
  if (animateOnMount) onMounted(play);

  return { play, pause, resume, stop };
};
