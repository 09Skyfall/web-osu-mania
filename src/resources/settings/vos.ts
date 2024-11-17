export enum SETTINGS {
  KEY_BINDINGS_4K = "KEY_BINDINGS_4K",
  KEY_BINDINGS_7K = "KEY_BINDINGS_7K",
  SCROLL_SPEED = "SCROLL_SPEED",
  BACKGROUND_BLUR = "BACKGROUND_BLUR",
  BACKGROUND_OPACITY = "BACKGROUND_OPACITY",
  SHOW_FPS = "SHOW_FPS",
  MASTER_VOLUME = "MASTER_VOLUME",
}

export const settingsMeta = {
  [SETTINGS.KEY_BINDINGS_4K]: { default: ["a", "s", "k", "l"] },
  [SETTINGS.KEY_BINDINGS_7K]: { default: ["a", "s", "d", " ", "j", "k", "l"] },
  [SETTINGS.SCROLL_SPEED]: { default: 1.5 /* px/ms */ },
  [SETTINGS.BACKGROUND_BLUR]: { default: 6 /* px */ },
  [SETTINGS.BACKGROUND_OPACITY]: { default: 1 },
  [SETTINGS.SHOW_FPS]: { default: false },
  [SETTINGS.MASTER_VOLUME]: { default: 1 },
} satisfies Record<SETTINGS, { default: any }>;

export type SettingDefaultT<S extends SETTINGS> = (typeof settingsMeta)[S]["default"];

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
