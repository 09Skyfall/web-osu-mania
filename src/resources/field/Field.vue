<script setup lang="ts">
import Column from '../column/Column.vue';
import Judgement from '../judgement/Judgement.vue';
import { type ColumnProps } from '../column/store';
import { onMounted, ref } from 'vue';

// TODO: spostare
type Map = {
  cols: ColumnProps[],
  song?: string,
}

defineProps<{ map: Map }>()

const screenHeight = ref(window.innerHeight)
const onScreenResize = ([entry]: [ResizeObserverEntry]) => screenHeight.value = entry.borderBoxSize[0].blockSize

const columns = ref<(typeof Column)[]>([])
onMounted(() => {
  const audio = document.getElementById("audio") as HTMLAudioElement
  audio?.addEventListener("canplaythrough", () => {
    columns.value.forEach(c => c.play())
    audio.play()
    console.log("start playing")
  })
})
</script>

<template>
  <audio id="audio" :src="map.song"></audio>
  <div class="field" v-resize="onScreenResize">
    <template v-for="(col, i) of map.cols" :key="i">
      <Column ref="columns" :height="screenHeight" :width="100" v-bind="col" />
    </template>
    <judgement class="judgement" />
  </div>
</template>

<style scoped>
.field {
  display: grid;
  grid-auto-columns: 100px;
  grid-auto-flow: column;
  height: 100dvh;

  position: relative;
}
.judgement {
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>