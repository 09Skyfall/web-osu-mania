import { useMutationObserver } from "./useMutationObserver";
import { assert } from "../utils/assertions";
import { onMounted, onUnmounted, ref } from "vue";
import { normalizeTargetElement } from "../utils/normalizeTargetElement";
import { useAnimate } from "./useAnimate";
import { getScrollParent } from "../utils/getScrollParent";

/**
 * @doc used RAF instead of scroll event loop to make computations: why?
 * @doc per risolvere problema degli elementi che flickeravano avevo concettualmente due opzioni:
 *    - rootMargins negativi sulle y (ma sembra che fuori dalla viewPort non funzioni)
 *    - all'intersezione di un el aggiungere nei visibleElements anche i fratelli più vicini
 *    -> risolto con una soluzione più banale: opacity a 0 fintanto che non ho calcolato la width
 *
 * Special Attributes:
 *  - p-skip: skips width computation on the element
 *  - p-multiplier: multiplies the computed width of the element
 *  - p-skip-scroll-parent: skips given element when searching for the scroll parent
 */

type UseParabolicListOptions = {
  baseWidth: number;
  factor: number;
  type?: "positive" | "negative";
};

export const useParabolicList = (
  target: Element | string,
  { baseWidth, factor, type = "negative" }: UseParabolicListOptions,
) => {
  const visibleElements = new WeakSet<Element>();
  const targetElement = ref<Element | null>(null);

  const setElementWidth = (el: HTMLElement) => {
    const scrollParent = _getScrollParent(el);

    if (scrollParent === null) return;

    const offsetFromTopBorder = el.offsetTop - scrollParent.scrollTop;

    // values inside the range [-scrollParent.clientHeight / 2, +scrollParent.clientHeight / 2]
    const valuesRange = offsetFromTopBorder - scrollParent.clientHeight / 2;

    // values inside the range [-1, +1]
    const normalizedRange = valuesRange / (scrollParent.clientHeight / 2);

    const width =
      baseWidth + factor * (type === "positive" ? normalizedRange ** 2 : -(normalizedRange ** 2));

    const multiplier = parseFloat(el.getAttribute("p-multiplier") ?? "1");

    el.style.width = `${width * multiplier}px`;
    el.style.opacity = "1";
  };

  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target.getAttribute("p-skip") !== null) return;

      if (entry.isIntersecting) {
        assert(entry.target instanceof HTMLElement);

        setElementWidth(entry.target);
        visibleElements.add(entry.target);
      } else {
        assert(entry.target instanceof HTMLElement);
        entry.target.style.opacity = "0";
        visibleElements.delete(entry.target);
      }
    });
  });

  onMounted(() => {
    targetElement.value = normalizeTargetElement(target);

    [...targetElement.value.children].forEach((node) => {
      intersectionObserver.observe(node);
    });
  });

  const onMutation = (m: MutationRecord) => {
    m.addedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      assert(node instanceof Element, "Expected node to be of type Element");
      intersectionObserver.observe(node);
    });

    m.removedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      assert(node instanceof Element, "Expected node to be of type Element");
      intersectionObserver.unobserve(node);
    });
  };

  useMutationObserver(target, (mutations) => mutations.forEach(onMutation), {
    childList: true,
  });

  useAnimate(() => {
    if (!targetElement.value) return;
    const listItems = [...targetElement.value.children] as HTMLElement[];

    listItems.forEach((el) => {
      if (visibleElements.has(el)) setElementWidth(el);
    });
  });

  onUnmounted(() => {
    intersectionObserver.takeRecords();
    intersectionObserver.disconnect();
  });
};

const _getScrollParent = (el: Element) => {
  const scrollParent = getScrollParent(el);

  if (!scrollParent) return null;

  if (scrollParent.getAttribute("p-skip-scroll-parent") !== null) {
    return getScrollParent(scrollParent);
  }

  return scrollParent;
};