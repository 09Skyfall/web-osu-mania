import { defineStore } from "pinia";
import { ref } from "vue";

export enum MANIA_KEY_MODE {
  "4K" = "4K",
  "7K" = "7K",
}

export const useSettingsStore = defineStore("settings", () => {
  const SCROLL_SPEED = ref(1.5); // px/ms

  const keyBindings = new Map([
    [MANIA_KEY_MODE["4K"], ["a", "s", "k", "l"]],
    [MANIA_KEY_MODE["7K"], ["a", "s", "d", " ", "j", "k", "l"]],
  ]);

  return {
    SCROLL_SPEED,
    keyBindings,
  };
});
