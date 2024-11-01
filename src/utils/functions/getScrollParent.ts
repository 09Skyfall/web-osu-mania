export const getScrollParent = (el: Element): Element | null => {
  return getFirstScrollableEl(el?.parentElement ?? null);
};

const getFirstScrollableEl = (el: Element | null): Element | null => {
  if (el == null) return null;

  if (el.scrollHeight > el.clientHeight) {
    return el;
  } else {
    return getFirstScrollableEl(el.parentElement);
  }
};
