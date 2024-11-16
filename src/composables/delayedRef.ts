import { customRef, MaybeRefOrGetter, toValue } from "vue";

export function delayedRef<T>(value: MaybeRefOrGetter<T> | undefined, delay: number) {
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return toValue(value);
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
