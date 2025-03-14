import { useMutationObserver } from "./useMutationObserver";
import { onMounted, onUnmounted, ref } from "vue";
import { useAnimate } from "./useAnimate";
import { assert } from "../utils/assertions/assert";
import { normalizeTargetElement } from "../utils/functions/normalizeTargetElement";
import { getScrollParent } from "../utils/functions/getScrollParent";

/**
 * @doc used RAF instead of scroll event loop to make computations: why?
 * @doc per risolvere problema degli elementi che flickeravano avevo concettualmente due opzioni:
 *    - rootMargins negativi sulle y (ma sembra che fuori dalla viewPort non funzioni)
 *    - all'intersezione di un el aggiungere nei visibleElements anche i fratelli più vicini
 *    -> risolto con una soluzione più banale: opacity a 0 fintanto che non ho calcolato la width
 *    -> soluzione successiva: rimosso opacity e semplicemente calcolato la width la prima volta
 *       dentro il mutationObserver.
 *
 * Special Attributes:
 *  - p-skip: skips width computation on the element
 *  - p-skip-scroll-parent: skips given element when searching for the scroll parent
 */

type UseParabolicListOptions = {
  factor: number;
};

export const useParabolicList = (target: Element | string, { factor }: UseParabolicListOptions) => {
  assert(factor >= 1, "factor must be more than 1");

  const visibleElements = new WeakSet<Element>();
  const targetElement = ref<Element | null>(null);

  const setElementWidth = (el: HTMLElement) => {
    const scrollParent = _getScrollParent(el);

    if (scrollParent === null) return;

    // Offset from the half height of the el to the top of the scroll parent
    const offsetFromTopBorder =
      Math.min(el.offsetTop - scrollParent.scrollTop, scrollParent.clientHeight) +
      el.clientHeight / 2;

    // values inside the range [~-scrollParent.clientHeight / 2, +scrollParent.clientHeight / 2]
    const valuesRange = offsetFromTopBorder - scrollParent.clientHeight / 2;

    // values inside the range [~-1, +1]
    const normalizedRange = valuesRange / (scrollParent.clientHeight / 2);

    const xOffset = factor * 20 * -(normalizedRange ** 2);

    el.style.translate = `${xOffset}px`;
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

      assert(node instanceof HTMLElement, "Expected node to be of type Element");

      if (node.getAttribute("p-skip") === null) setElementWidth(node);

      intersectionObserver.observe(node);
    });

    m.removedNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      assert(node instanceof HTMLElement, "Expected node to be of type Element");

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
