import { onMounted, onUnmounted, ref } from "vue";
import { throttle } from "lodash";

export const useResize = (el: Element) => {
  const borderBoxBlock = ref(0);
  const borderBoxInline = ref(0);

  const onResize: ResizeObserverCallback = ([entry]: ResizeObserverEntry[]) => {
    borderBoxBlock.value = entry.borderBoxSize[0].blockSize;
    borderBoxInline.value = entry.borderBoxSize[0].inlineSize;
  };

  const resizeObs = new ResizeObserver(throttle(onResize, 250));

  onMounted(() => resizeObs.observe(el));
  onUnmounted(() => resizeObs.disconnect());

  return {
    borderBoxBlock,
    borderBoxInline,
  };
};
