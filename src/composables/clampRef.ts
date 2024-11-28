import { customRef } from "vue";

type ClampRefOptions = {
  min: number;
  max: number;
};

export function clampRef(
  value: number,
  { min, max }: ClampRefOptions = {
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
  },
) {
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        value = Math.max(min, Math.min(max, newValue));
        trigger();
      },
    };
  });
}
