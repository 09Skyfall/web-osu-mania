import { nonNull } from "../assertions/nonNull";

export const normalizeTargetElement = <T extends EventTarget>(target: T | string) => {
  if (typeof target !== "string") return target;

  const elem = document.querySelector(target);

  return nonNull(elem);
};
