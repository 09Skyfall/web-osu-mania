import { computed, ref } from "vue";

export const useCanvas = (options?: CanvasRenderingContext2DSettings) => {
  const canvas = ref<HTMLCanvasElement | null>(null);
  const ctx = computed(() => canvas.value?.getContext("2d", options) ?? undefined);

  return { canvas, ctx };
};
