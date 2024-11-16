import { defineStore } from "pinia";
import { customRef } from "vue";

export enum SETTINGS {
  KEY_BINDINGS_4K = "KEY_BINDINGS_4K",
  KEY_BINDINGS_7K = "KEY_BINDINGS_7K",
  SCROLL_SPEED = "SCROLL_SPEED",
  BACKGROUND_BLUR = "BACKGROUND_BLUR",
  BACKGROUND_OPACITY = "BACKGROUND_OPACITY",
  SHOW_FPS = "SHOW_FPS",
  MASTER_VOLUME = "MASTER_VOLUME",
}

const settingsMeta = {
  [SETTINGS.KEY_BINDINGS_4K]: { default: ["a", "s", "k", "l"] },
  [SETTINGS.KEY_BINDINGS_7K]: { default: ["a", "s", "d", " ", "j", "k", "l"] },
  [SETTINGS.SCROLL_SPEED]: { default: 1.5 /* px/ms */ },
  [SETTINGS.BACKGROUND_BLUR]: { default: 6 /* px */ },
  [SETTINGS.BACKGROUND_OPACITY]: { default: 1 },
  [SETTINGS.SHOW_FPS]: { default: false },
  [SETTINGS.MASTER_VOLUME]: { default: 1 },
} satisfies Record<SETTINGS, { default: any }>;

type SettingDefaultT<S extends SETTINGS> = (typeof settingsMeta)[S]["default"];

export enum SETTINGS_CATEGORY {
  INPUT = "INPUT",
  AUDIO = "AUDIO",
  GAMEPLAY = "GAMEPLAY",
  // GENERAL = "GENERAL",
}

export const settingsCategories = {
  [SETTINGS_CATEGORY.INPUT]: {
    value: SETTINGS_CATEGORY.INPUT,
    title: "Input",
    icon: "arcticons:keyboard",
  },
  [SETTINGS_CATEGORY.AUDIO]: {
    value: SETTINGS_CATEGORY.AUDIO,
    title: "Audio",
    icon: "arcticons:volume",
  },
  [SETTINGS_CATEGORY.GAMEPLAY]: {
    value: SETTINGS_CATEGORY.GAMEPLAY,
    title: "Gameplay",
    icon: "arcticons:aha-games",
  },
  // [SETTINGS_CATEGORY.GENERAL]: {
  //   value: SETTINGS_CATEGORY.GENERAL,
  //   title: "General",
  //   icon: "arcticons:settings",
  // },
};

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
