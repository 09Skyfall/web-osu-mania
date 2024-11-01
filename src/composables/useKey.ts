import { ref } from "vue";
import { useEventListener } from "./useEventListener";

export type UseKeyOptions = {
  on_key_down?: (e: KeyboardEvent) => void;
  on_key_up?: (e: KeyboardEvent) => void;
};

export const useKey = (key: KeyboardEvent["key"], options: UseKeyOptions = {}) => {
  const active = ref(false);

  const onKeyDown = (e: Event) => {
    if ((e as KeyboardEvent).key !== key) return;
    if (options.on_key_down) options.on_key_down(e as KeyboardEvent);
    active.value = true;
  };

  const onKeyUp = (e: Event) => {
    if ((e as KeyboardEvent).key !== key) return;
    if (options.on_key_up) options.on_key_up(e as KeyboardEvent);
    active.value = false;
  };

  useEventListener(document, "keydown", onKeyDown);
  useEventListener(document, "keyup", onKeyUp);

  return { active };
};
