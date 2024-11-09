<script setup lang="ts">
import ImportButton from "../resources/beatmap/ImportButton.vue";
import Icon from "./Icon.vue";

const openSettings = () => {
  //
};
</script>

<template>
  <aside>
    <a href="https://github.com/09Skyfall/web-osu-mania" target="_blank">
      <Icon class="button-icon" icon="arcticons:github" size="48px" />
    </a>

    <a href="https://osu.ppy.sh/beatmapsets?m=3" target="_blank">
      <Icon class="button-icon" icon="arcticons:osu" size="48px" />
    </a>

    <button icon @click="openSettings">
      <Icon class="button-icon" icon="arcticons:settings" size="48px" />
    </button>

    <div class="import-button-container">
      <ImportButton class="home-import-button" />
    </div>
  </aside>
</template>

<style scoped>
aside {
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  flex-direction: column;
  justify-content: end;
  gap: 1rem;

  width: 65px;
  height: 100dvh;

  background-color: var(--primary);
  color: white;
}

button[icon],
a {
  padding: 2px;
  overflow: hidden;
  text-align: center;

  .button-icon {
    transition: all 250ms ease-in-out;
  }

  &:hover .button-icon {
    transform: scale(1.1) rotateZ(15deg);
    stroke-width: 2px;
  }
}

.import-button-container {
  position: relative;
  height: 80px;
  margin-bottom: 5dvh;
}

.home-import-button {
  position: absolute;
  right: 0;
  z-index: 2;
}
</style>
