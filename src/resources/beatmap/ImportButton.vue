<script setup lang="ts">
import Icon from "../../components/Icon.vue";
import { beatmapDb } from "./database";
import { oszToJson } from "./store";

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  if (!files) return;

  await beatmapDb.open();
  [...files].forEach(async (file) => {
    const map = await oszToJson(file);
    await beatmapDb.addItem(map);
    console.log(`Successfully imported ${file.name}`);
  });
};
</script>

<template>
  <div class="import-button">
    <Icon icon="solar:import-outline" size="5rem" />
    <span class="text">Import beatmaps</span>
    <input type="file" accept=".osz" multiple @change="onSelectFile" />
  </div>
</template>

<style scoped>
.import-button {
  display: flex;
  align-items: center;

  width: 80px;
  height: 80px;

  background-color: var(--primary);

  border: 1px solid white;
  border-radius: 40px 0 0 40px;
  border-right: none;

  transition: width 150ms;

  & .text {
    flex: 1 1 0;
    overflow: hidden;
    text-transform: uppercase;
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: 0.05rem;
    text-align: center;
  }
}

.import-button:hover {
  width: 190px;

  transform-style: preserve-3d;

  &::before {
    width: 100%;
    height: 100%;
    border-radius: inherit;

    transform: translateZ(-1px);

    position: absolute;

    content: "";
    box-shadow: var(--primary) 0 0 0 0;

    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
}

.import-button > input {
  height: 100%;
  width: 100%;
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
}

@keyframes ping {
  75%,
  100% {
    box-shadow: transparent 0 0 0 20px;
  }
}
</style>
