import { onBeforeUnmount, onMounted } from "vue";
import { normalizeTargetElement } from "../utils/functions/normalizeTargetElement";

export const useEventListener = (
  target: EventTarget | string,
  type: string,
  callback: (e: Event) => void,
) => {
  onMounted(() => {
    normalizeTargetElement(target).addEventListener(type, callback);
  });

  onBeforeUnmount(() => {
    normalizeTargetElement(target).removeEventListener(type, callback);
  });
};
