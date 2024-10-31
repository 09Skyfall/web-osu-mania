<script setup lang="ts">
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
    <span class="plus">+</span>
    <input type="file" accept=".osz" multiple @change="onSelectFile" />
  </div>
</template>

<style scoped>
.plus {
  font-size: 16rem;
  background-color: rgba(0, 0, 0, 0.8);
  color: transparent;
  text-shadow: 0px 0 3px rgba(230, 0, 230, 1);
  background-clip: text;
}

.import-button {
  width: 300px;
  height: 300px;
  background-color: purple;
  border-radius: 100%;
  box-shadow: inset rgb(255, 0, 255) 0 0 48px 0;
  border: 1px solid white;
  transition-property: width, height;
  transition-duration: 150ms;
}

.import-button:hover {
  width: 350px;
  height: 350px;
  transform-style: preserve-3d;

  &::before {
    width: 100%;
    height: 100%;
    border-radius: 100%;

    transform: translateZ(-1px);

    position: absolute;

    content: "";
    box-shadow: purple 0 0 0 0;

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
    box-shadow: transparent 0 0 0 40px;
  }
}
</style>
