import { AsyncFunction } from "../../types/AsyncFunction";
import { wait } from "./wait";

export const waitAtLeast = <Fn extends AsyncFunction>(cb: Fn, ms: number) => {
  return async (...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> => {
    const p = cb(...args);
    await wait(ms);
    return p;
  };
};
