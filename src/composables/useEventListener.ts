import { onMounted, onUnmounted } from "vue"

export const useEventListener = (
  target: EventTarget, 
  type: string,
  callback: (e: Event) => void
) => {
  onMounted(() => target.addEventListener(type, callback))
  onUnmounted(() => target.removeEventListener(type, callback))
}
