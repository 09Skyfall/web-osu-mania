import { assert } from "./assertions";

export const normalizeTargetElement = <T extends EventTarget>(
  target: T | string,
) => {
  if (typeof target !== "string") return target;

  const elem = document.querySelector(target);
  assert(elem, "Expected target to be non null.");

  return elem;
};
