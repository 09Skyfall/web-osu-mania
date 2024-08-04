import { onMounted, ref } from "vue";

export type AnimateFunction = (delta_t: number) => void;
export type UseAnimateOptions = { animateOnMount?: boolean };

export const useAnimate = (
  cb: AnimateFunction,
  { animateOnMount = true }: UseAnimateOptions = {},
) => {
  const delta_t = ref(0);
  const last_timestamp = ref<number | null>(null);

  const _animate = (timestamp: number) => {
    if (!last_timestamp.value) last_timestamp.value = timestamp;
    delta_t.value = timestamp - last_timestamp.value;
    last_timestamp.value = timestamp;

    cb(delta_t.value);

    requestAnimationFrame(_animate);
  };

  const animate = () => requestAnimationFrame(_animate);

  // TODO: does the callback stop running after unmount? i think not :(
  if (animateOnMount) onMounted(animate);

  return { animate };
};
