import { onMounted, onUnmounted, ref } from "vue";
import { MaybeArray } from "../types/MaybeArray";
import { toArray } from "../utils/functions/toArray";
import { assert } from "../utils/assertions/assert";

export type AnimateFunction = (delta_t: number) => void;

export type UseAnimateOptions = { animateOnMount?: boolean };

export const useAnimate = (
  cb: MaybeArray<AnimateFunction>,
  { animateOnMount = true }: UseAnimateOptions = {},
) => {
  const delta_t = ref(0);
  const last_timestamp = ref<number | null>(null);
  const paused = ref(false);
  const animation_id = ref<number | null>(null);
  const animations = toArray(cb);

  const add = (_animations: MaybeArray<AnimateFunction>) => {
    animations.push(...toArray(_animations));
  };

  const _animate = (timestamp: number) => {
    if (!last_timestamp.value) last_timestamp.value = timestamp;
    delta_t.value = timestamp - last_timestamp.value;
    last_timestamp.value = timestamp;

    if (!paused.value) animations.forEach((animation) => animation(delta_t.value));

    animation_id.value = requestAnimationFrame(_animate);
  };

  const play = () => (animation_id.value = requestAnimationFrame(_animate));

  const pause = () => {
    paused.value = true;
  };

  const resume = () => {
    paused.value = false;
  };

  const stop = () => {
    queueMicrotask(() => {
      assert(animation_id.value, "Cannot stop animation before its start");
      cancelAnimationFrame(animation_id.value);
      last_timestamp.value = null;
    });
  };

  if (animateOnMount) onMounted(play);

  onUnmounted(stop);

  return { play, pause, resume, stop, add };
};
