import { ref } from "vue";
import { useEventListener } from "./useEventListener";

export const useHover = (target: string | EventTarget) => {
  const hovering = ref(false);

  useEventListener(target, "mouseenter", () => (hovering.value = true));
  useEventListener(target, "mouseleave", () => (hovering.value = false));

  return { hovering };
};
