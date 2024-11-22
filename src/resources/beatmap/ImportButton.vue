<script setup lang="ts">
import Icon from "../../components/Icon.vue";
import { beatmapDb } from "./database";

const onSelectFile = async (e: Event) => {
  const files = (e.target as HTMLInputElement)?.files;
  if (!files) return;

  await beatmapDb.open();

  await beatmapDb.addItem([...files]);
};
</script>

<template>
  <div class="import-button ping">
    <Icon icon="solar:import-outline" size="5rem" class="import-icon" />
    <span class="text">Import beatmaps</span>
    <input type="file" accept=".osz" multiple @change="onSelectFile" />
  </div>
</template>

<style scoped>
@import url("../../../assets/ping.css");

.import-button {
  display: flex;
  align-items: center;

  width: 100px;
  height: 80px;

  background-color: var(--primary-darker);
  color: var(--primary-darker);

  border: 1px solid white;
  border-radius: 40px 0 0 40px;
  border-right: none;

  transition: width 150ms ease-in-out;

  & .text {
    color: white;
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
  width: 210px;
}

.import-button > input {
  height: 100%;
  width: 100%;
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
}

.import-icon {
  margin-right: 20px;
}
</style>
