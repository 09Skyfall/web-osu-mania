<script setup lang="ts">
import { beatmapDb } from "./database";
import { Beatmap, BeatmapLevel } from "./store";
import { computed, inject, nextTick, onBeforeMount, onUnmounted, ref } from "vue";
import { assert } from "../../utils/assertions/assert";
import { toArray } from "../../utils/functions/toArray";
import List from "../../components/List.vue";
import FrequencyVisualizer from "../audio/FrequencyVisualizer.vue";
import { AudioStream } from "../audio/AudioStream";
import { last, random } from "lodash";
import { mapAsync } from "../../utils/functions/mapAsync";
import { nonNull } from "../../utils/assertions/nonNull";
import { AudioGraphI } from "../audio/AudioGraph";
import { UnsubscribeCallback } from "../../utils/classes/Subscribable";
import { ToastService } from "../../services/ToastService";
import Spacer from "../../components/Spacer.vue";

const emit = defineEmits<{
  "update:selected-beatmap": [beatmap: Beatmap<string>];
  "update:selected-level": [level: BeatmapLevel];
  "select:level": [beatmapId: string, levelId: string];
}>();

const p = defineProps<{
  selectedBeatmap: Beatmap<string> | null;
  selectedLevel: BeatmapLevel | null;
}>();

const audioStream = inject("audioStream", ref(new AudioStream()));

let unsubscribeFromAudioStream: UnsubscribeCallback | null = null;

const audioAnalyser = computed(() => {
  const analyser = audioStream.value.context.createAnalyser();
  analyser.fftSize = 512;

  const onUpdateGraph = (graph: AudioGraphI) => graph.output.inbounds[0].node.connect(analyser);

  audioStream.value.currentGraphs.forEach(onUpdateGraph);
  unsubscribeFromAudioStream = audioStream.value.subscribe("update:graphs", onUpdateGraph);

  return analyser;
});

const beatmaps = ref<Beatmap<string>[]>([]);

const isBeatmapSelected = (id: string) => p.selectedBeatmap?.id === id;
const isLevelSelected = (id: string) => p.selectedLevel?.id === id;

const onSelectBeatmap = (e: Event, beatmap: Beatmap<string>) => {
  if (p.selectedLevel && beatmap.id === p.selectedBeatmap?.id) {
    return emit("select:level", beatmap.id, p.selectedLevel.id);
  }

  emit("update:selected-beatmap", beatmap);

  assert(e.target instanceof HTMLElement);
  e.target.scrollIntoView({ behavior: "smooth", block: "center" });
};

const onSelectLevel = (level: BeatmapLevel) => {
  if (p.selectedBeatmap && level.id === p.selectedLevel?.id) {
    return emit("select:level", p.selectedBeatmap.id, level.id);
  }

  emit("update:selected-level", level);
};

const unsubscribeFromDb = beatmapDb.subscribe("add", async (keys) => {
  const maps = await mapAsync(keys, async (key) => {
    const beatmap = await beatmapDb.getItem("beatmaps", key);
    return {
      ...beatmap,
      imageSource: beatmap.imageSource ? URL.createObjectURL(beatmap.imageSource) : undefined,
    };
  });

  beatmaps.value.push(...maps);

  requestAnimationFrame(() => {
    const el = document.getElementById(nonNull(last(beatmaps.value)).id);
    el?.click();
  });
});

onBeforeMount(async () => {
  await beatmapDb.open();

  if ((await beatmapDb.count("beatmaps")) === 0) {
    ToastService.promise(
      async () => {
        const defaultBeatmaps = import.meta.glob("/assets/default-beatmaps/**.osz");

        const imports = (await mapAsync(Object.keys(defaultBeatmaps), (path) =>
          defaultBeatmaps[path](),
        )) as { default: string }[];

        const files = await mapAsync(imports, async (i) => (await fetch(i.default)).blob());

        await beatmapDb.addItem(files);
      },
      {
        pending: "Importing some beatmaps, hold on tight!",
        success: "Beatmaps imported successfully, have fun!",
        error: "Something went wrong. Retry later :(",
      },
    );
  } else {
    beatmaps.value = toArray(await beatmapDb.getItem("beatmaps")).map((b) => ({
      ...b,
      imageSource: b.imageSource ? URL.createObjectURL(b.imageSource) : undefined,
    }));

    nextTick(() => {
      const beatmaps = document.querySelectorAll<HTMLLIElement>(".beatmap-list-item");
      beatmaps[random(0, beatmaps.length - 1, false)].click();
    });
  }
});

onUnmounted(() => {
  unsubscribeFromDb();
  unsubscribeFromAudioStream?.();
});
</script>

<template>
  <List parabolic class="beatmaps-list">
    <Spacer height="50%" />

    <template v-for="(beatmap, i) of beatmaps" :key="i">
      <li
        class="list-item beatmap-list-item"
        :class="{ selected: isBeatmapSelected(beatmap.id) }"
        :style="`--background-image-src: url('${beatmap.imageSource}')`"
        :selected="isBeatmapSelected(beatmap.id) ? 1.15 : 1"
        :id="beatmap.id"
        @click="onSelectBeatmap($event, beatmap)"
      >
        <div class="list-item-content beatmap-list-item-content">
          <span class="title">
            <strong>{{ beatmap.levels[0].title }}</strong>
          </span>
          <span class="subtitle">{{ beatmap.levels[0].artist }}</span>
        </div>

        <FrequencyVisualizer
          v-if="isBeatmapSelected(beatmap.id)"
          width="100%"
          height="50px"
          :analyser="audioAnalyser"
          class="frequency-visualizer"
        />
      </li>
      <!-- todo: unfold animation -->
      <template v-if="isBeatmapSelected(beatmap.id)">
        <li
          v-for="(level, i) of beatmap.levels"
          :key="i"
          class="list-item beatmap-level-list-item"
          :selected="isLevelSelected(level.id) ? 1.1 : 1"
          :class="{ selected: isLevelSelected(level.id) }"
          @click="onSelectLevel(level)"
        >
          <div class="list-item-content beatmap-level-list-item-content">
            <span class="title">{{ level.levelTitle }} [{{ level.keyCount }}K]</span>
          </div>
        </li>
      </template>
    </template>

    <Spacer height="50%" />
  </List>
</template>

<style scoped>
.frequency-visualizer {
  position: absolute;
  bottom: 0;
}

.beatmaps-list {
  height: 100dvh;
  position: relative;
}

.list-item {
  position: relative;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: black 2px 2px 8px 0;
  transition: margin 150ms;

  &.selected {
    box-shadow: white 0 0 8px 0;
    border: 1px solid white;
    margin: 8px 0;
  }

  &::before {
    content: "";
    opacity: 0;
    transition: opacity 250ms;
  }

  &:hover::before {
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

.beatmap-list-item {
  min-height: 70px;
  max-height: 100px;
  height: 10%;

  width: 60%;
  min-width: 680px;
  max-width: 1280px;

  scale: 1 1.05;

  background-image: var(--background-image-src);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  &.selected {
    width: 67%;
    min-width: 710px;
    max-width: 1310px;
  }
}

.beatmap-list-item-content {
  padding: 1rem;
  background: linear-gradient(45deg, transparent, rgba(0, 0, 0, 0.5) 85%);

  .title {
    line-height: 1.45rem;
    letter-spacing: 0.03rem;
    font-size: 1.15rem;
  }

  .subtitle {
    letter-spacing: 0.015rem;
  }
}

.beatmap-level-list-item {
  min-height: 35px;
  max-height: 50px;
  height: 5%;

  width: 57%;
  min-width: 650px;
  max-width: 1250px;

  background: linear-gradient(45deg, var(--secondary) 35%, var(--primary));
  margin: 4px 0;

  &.selected {
    width: 64%;
    min-width: 680px;
    max-width: 1280px;
  }
}

.beatmap-level-list-item-content {
  padding: 0.5rem 1rem;
}
</style>
