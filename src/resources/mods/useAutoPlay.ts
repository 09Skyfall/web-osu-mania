import { storeToRefs } from "pinia";
import { CanvasNote } from "../note/store";
import { useGameFieldStore } from "../field/store";
import { wait } from "../../utils/functions/wait";
import { useSettingsStore } from "../settings/store";

export const useAutoPlay = () => {
  const { COL_HEIGHT } = storeToRefs(useGameFieldStore());
  const { SCROLL_SPEED } = storeToRefs(useSettingsStore());

  const hit = async (note: CanvasNote, key: KeyboardEvent["key"]) => {
    await wait((COL_HEIGHT.value - note.y) / SCROLL_SPEED.value);
    document.dispatchEvent(new KeyboardEvent("keydown", { key }));
    await wait(100);
    document.dispatchEvent(new KeyboardEvent("keyup", { key }));
  };

  return { hit };
};
