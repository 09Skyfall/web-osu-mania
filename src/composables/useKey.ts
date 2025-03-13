import { ref } from "vue";
import { useEventListener } from "./useEventListener";
import { isLetter } from "../utils/functions/isLetter";

export type UseKeyOptions = {
  on_key_down?: (e: KeyboardEvent) => void;
  on_key_up?: (e: KeyboardEvent) => void;
  caseSensitive?: boolean;
};

export const useKey = (
  key: KeyboardEvent["key"],
  { on_key_down, on_key_up, caseSensitive = false }: UseKeyOptions = {},
) => {
  const active = ref(false);

  const isCorrectKey = (k: KeyboardEvent["key"]) => {
    if (!caseSensitive && isLetter(key)) return k.toLowerCase() === key.toLowerCase();
    else return k === key;
  };

  const onKeyDown = (e: Event) => {
    if (!isCorrectKey((e as KeyboardEvent).key)) return;

    if (on_key_down) on_key_down(e as KeyboardEvent);

    active.value = true;
  };

  const onKeyUp = (e: Event) => {
    if (!isCorrectKey((e as KeyboardEvent).key)) return;

    if (on_key_up) on_key_up(e as KeyboardEvent);

    active.value = false;
  };

  useEventListener(document, "keydown", onKeyDown);
  useEventListener(document, "keyup", onKeyUp);

  return { active };
};
