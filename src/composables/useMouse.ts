import { ref } from "vue";
import { useEventListener } from "./useEventListener";

export type UseMouseOptions = {
  on_mouse_move?: (e: MouseEvent) => void;
  target?: string | EventTarget;
};

export const useMouse = (options: UseMouseOptions = { target: document }) => {
  const x = ref(0);
  const y = ref(0);

  const onMouseMove = (e: Event) => {
    const event = e as MouseEvent;

    if (options.on_mouse_move) options.on_mouse_move(event);
    x.value = event.clientX;
    y.value = event.clientY;
  };

  useEventListener(document, "mousemove", onMouseMove);

  return { x, y };
};
