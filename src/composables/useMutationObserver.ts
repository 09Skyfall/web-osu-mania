import { onMounted, onUnmounted } from "vue";
import { normalizeTargetElement } from "../utils/normalizeTargetElement";

export const useMutationObserver = (
  el: Node | string,
  cb: MutationCallback,
  options: MutationObserverInit,
) => {
  const observer = new MutationObserver(cb);

  onMounted(() => {
    observer.observe(normalizeTargetElement(el), options);
  });

  onUnmounted(() => {
    observer.takeRecords();
    observer.disconnect();
  });
};
