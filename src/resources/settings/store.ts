import { defineStore } from "pinia";
import { customRef, watch } from "vue";
import { audioManager } from "../audio/AudioManager";
import { SETTINGS, SettingDefaultT, settingsMeta } from "./vos";

const createSettingsRef = <S extends SETTINGS>(s: S) => {
  return customRef<SettingDefaultT<S>>((track, trigger) => ({
    get() {
      track();
      return JSON.parse(localStorage.getItem(s) ?? JSON.stringify(settingsMeta[s].default));
    },
    set(value) {
      localStorage.setItem(s, JSON.stringify(value));
      trigger();
    },
  }));
};

export const useSettingsStore = defineStore("settings", () => {
  const keyBindings4k = createSettingsRef(SETTINGS.KEY_BINDINGS_4K);
  const keyBindings7k = createSettingsRef(SETTINGS.KEY_BINDINGS_7K);
  const scrollSpeed = createSettingsRef(SETTINGS.SCROLL_SPEED);
  const backgroundBlur = createSettingsRef(SETTINGS.BACKGROUND_BLUR);
  const backgroundOpacity = createSettingsRef(SETTINGS.BACKGROUND_OPACITY);
  const showFps = createSettingsRef(SETTINGS.SHOW_FPS);
  const masterVolume = createSettingsRef(SETTINGS.MASTER_VOLUME);

  watch(masterVolume, (value) => (audioManager.volume = value / 100));

  return {
    keyBindings4k,
    keyBindings7k,
    scrollSpeed,
    backgroundBlur,
    backgroundOpacity,
    showFps,
    masterVolume,
  };
});
