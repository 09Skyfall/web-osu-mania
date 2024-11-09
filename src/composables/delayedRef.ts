import { customRef } from "vue";

export function delayedRef<T>(value: T | undefined, delay: number) {
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}
