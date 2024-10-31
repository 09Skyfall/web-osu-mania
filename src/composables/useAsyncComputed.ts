import { UnwrapRef, ref, watchEffect } from "vue";

/**
 * Limitazione di quest'implementazione: https://vuejs.org/guide/essentials/watchers.html#watcheffect
 * watchEffect only tracks dependencies during its synchronous execution.
 * When using it with an async callback, only properties accessed before the first await tick will be tracked.
 */
export const useAsyncComputed = <R>(initalValue: R, getter: () => Promise<R>) => {
  const value = ref(initalValue);
  const loading = ref(true);

  const trigger = () => {
    loading.value = true;
    getter().then((res) => {
      value.value = res as UnwrapRef<R>;
      loading.value = false;
    });
  };

  watchEffect(trigger);

  return { value, loading, trigger };
};
