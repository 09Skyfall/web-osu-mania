import { storeToRefs } from "pinia";
import { wait } from "../../utils/wait";
import { CanvasNote } from "../note/store";
import { useGameFieldStore } from "../field/store";

export const useAutoPlay = () => {
  const { COL_HEIGHT, SCROLL_SPEED } = storeToRefs(useGameFieldStore());

  const hit = async (note: CanvasNote, key: KeyboardEvent["key"]) => {
    await wait((COL_HEIGHT.value - note.y) / SCROLL_SPEED.value);
    document.dispatchEvent(new KeyboardEvent("keydown", { key }));
    await wait(100);
    document.dispatchEvent(new KeyboardEvent("keyup", { key }));
  };

  return { hit };
};
