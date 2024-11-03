<script setup lang="ts">
import { beatmapDb } from "./database";
import { Beatmap, BeatmapLevel } from "./store";
import { onBeforeMount, onBeforeUnmount, ref, watch } from "vue";
import { AudioStream } from "../audio/AudioStream";
import { useRouter } from "vue-router";
import { ROUTE } from "../../plugins/router";
import { assert } from "../../utils/assertions/assert";
import { toArray } from "../../utils/functions/toArray";
import List from "../../components/List.vue";

const router = useRouter();

const beatmaps = ref<Beatmap<string>[]>([]);
const audioStream = ref(new AudioStream());

const beatmapSelected = ref<Beatmap<string> | null>(null);
const levelSelected = ref<BeatmapLevel | null>(null);

const isBeatmapSelected = (id: string) => beatmapSelected.value?.id === id;
const isLevelSelected = (id: string) => levelSelected.value?.id === id;

const onSelectBeatmap = (e: Event, beatmap: Beatmap<string>) => {
  if (beatmap.id === beatmapSelected.value?.id) return goToGameField();

  beatmapSelected.value = beatmap;
  assert(e.target instanceof HTMLElement);
  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
};

const onSelectLevel = (level: BeatmapLevel) => {
  if (level.id === levelSelected.value?.id) return goToGameField();

  levelSelected.value = level;
};

const goToGameField = () => {
  assert(beatmapSelected.value && levelSelected.value);

  return router.push({
    name: ROUTE.GAME_FIELD,
    params: { beatmapId: beatmapSelected.value.id, levelId: levelSelected.value.id },
  });
};

onBeforeMount(async () => {
  await beatmapDb.open();

  beatmaps.value = toArray(await beatmapDb.getItem("beatmaps")).map((b) => ({
    ...b,
    audioSource: URL.createObjectURL(b.audioSource),
    imageSource: b.imageSource ? URL.createObjectURL(b.imageSource) : undefined,
  }));
});

onBeforeUnmount(() => {
  if (audioStream.value.hasReader()) audioStream.value.stop();
});

watch(beatmapSelected, async (selected, oldSelected) => {
  if (!selected?.id || selected.id === oldSelected?.id) return;

  levelSelected.value = selected.levels[0];

  const rs = await beatmapDb.getAudioStream(
    selected.id,
    levelSelected.value.audioPreviewTime /* ms */ / 1000,
  );

  if (audioStream.value.hasReader()) await audioStream.value.stop();
  audioStream.value = new AudioStream({ stream: rs });
  audioStream.value.stream();
});
</script>

<template>
  <List
    :items="beatmaps"
    bouncy
    parabolic
    class="beatmaps-list"
    :style="`--background-image-src: url('${beatmapSelected?.imageSource}')`"
  >
    <template #item="{ item: beatmap }">
      <li
        class="list-item beatmap-list-item"
        :class="{ selected: isBeatmapSelected(beatmap.id) }"
        :style="`--background-image-src: url('${beatmap.imageSource}')`"
        :p-multiplier="isBeatmapSelected(beatmap.id) ? 1.1 : 1"
        @click="onSelectBeatmap($event, beatmap)"
      >
        <div class="list-item-content beatmap-list-item-content">
          <span class="title">
            <strong>{{ beatmap.levels[0].title }}</strong>
          </span>
          <span class="subtitle">{{ beatmap.levels[0].artist }}</span>
        </div>
      </li>
      <!-- todo: unfold animation -->
      <template v-if="isBeatmapSelected(beatmap.id)">
        <li
          v-for="(level, i) of beatmap.levels"
          :key="i"
          class="list-item beatmap-level-list-item"
          :p-multiplier="isLevelSelected(level.id) ? 1.05 : 1"
          :class="{ selected: isLevelSelected(level.id) }"
          @click="onSelectLevel(level)"
        >
          <div class="list-item-content beatmap-level-list-item-content">
            <span class="title">{{ level.levelTitle }} [{{ level.keyMode }}]</span>
          </div>
        </li>
      </template>
    </template>
  </List>
</template>

<style scoped>
.beatmaps-list {
  height: 100dvh;
  position: relative;
}

.beatmaps-list::before {
  position: fixed;
  width: 100%;
  height: 100%;
  content: "";
  filter: blur(6px);
  background-size: cover;
  background-image: var(--background-image-src);
  background-size: 100% 100%;
  transition: background-image 250ms;
  z-index: -1;
}

.list-item {
  position: relative;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: black 2px 2px 8px 0;
  transition: margin 150ms;
}

.list-item-content {
  border-radius: inherit;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: center;
  gap: 4px;
}

.beatmap-list-item-content {
  padding: 1rem;
  background: linear-gradient(45deg, transparent, rgba(0, 0, 0, 0.5) 85%);
}

.beatmap-level-list-item-content {
  padding: 0.5rem 1rem;
}

.beatmap-list-item-content .title {
  line-height: 1.45rem;
  letter-spacing: 0.03rem;
  font-size: 1.15rem;
}

.beatmap-list-item-content .subtitle {
  letter-spacing: 0.015rem;
}

.list-item.selected {
  box-shadow: white 0 0 8px 0;
  border: 1px solid white;
  margin: 8px 0;
}

.list-item::before {
  content: "";
  opacity: 0;
  transition: opacity 250ms;
}

.list-item:hover::before {
  content: "";
  position: absolute;
  border-radius: inherit;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: 0.1;
  left: 0;
  top: 0;
}

.beatmap-list-item {
  height: 100px;
  transform: scaleY(1.05);

  background-image: var(--background-image-src);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.beatmap-level-list-item {
  background: linear-gradient(45deg, #eabec3bf 35%, #dd868c);
  height: 50px;
  margin: 4px 0;
}
</style>
