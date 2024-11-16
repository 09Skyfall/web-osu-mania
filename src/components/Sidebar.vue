<script setup lang="ts">
import { useRouter } from "vue-router";
import ImportButton from "../resources/beatmap/ImportButton.vue";
import Icon from "./Icon.vue";
import { ROUTE } from "../plugins/router";

const router = useRouter();

const openSettings = () => router.push({ name: ROUTE.SETTINGS });
</script>

<template>
  <aside>
    <div class="import-button-container">
      <ImportButton class="home-import-button" />
    </div>

    <button icon @click="openSettings">
      <Icon class="button-icon" icon="arcticons:settings" size="48px" />
    </button>

    <a href="https://osu.ppy.sh/beatmapsets?m=3" target="_blank">
      <Icon class="button-icon" icon="arcticons:osu" size="48px" />
    </a>

    <a href="https://github.com/09Skyfall/web-osu-mania" target="_blank">
      <Icon class="button-icon" icon="arcticons:github" size="48px" />
    </a>
  </aside>
</template>

<style scoped>
aside {
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 1rem;

  width: 65px;
  height: 100dvh;

  background-color: var(--primary);
  box-shadow: var(--primary) -2px 0 6px -2px;
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
  margin-top: 2.5dvh;
}

.home-import-button {
  position: absolute;
  right: 0;
}
</style>
