import { onMounted, onUnmounted } from "vue";
import { normalizeTargetElement } from "../utils/functions/normalizeTargetElement";

export const useEventListener = (
  target: EventTarget | string,
  type: string,
  callback: (e: Event) => void,
) => {
  onMounted(() => {
    normalizeTargetElement(target).addEventListener(type, callback);
  });

  onUnmounted(() => {
    normalizeTargetElement(target).removeEventListener(type, callback);
  });
};
