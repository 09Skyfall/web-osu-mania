import { computed, ref } from "vue"

export const useCanvas = () => {
  const canvas = ref<HTMLCanvasElement | null>(null)
  const ctx = computed(() => canvas.value?.getContext("2d") ?? undefined)

  return { canvas, ctx }
}