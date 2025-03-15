<script setup lang="ts">
import { inject, onUnmounted, ref, watch } from "vue";
import { AudioStream } from "../resources/audio/AudioStream";
import { AudioGraphI, AudioGraphNode } from "../resources/audio/AudioGraph";
import { AudioGraphUtils } from "../resources/audio/AudioGraphUtils";
import { useKey } from "../composables/useKey";
import { useRouter } from "vue-router";
import { ROUTE } from "../plugins/router";
import OtpInput from "../components/OtpInput.vue";
import { useSettingsStore } from "../resources/settings/store";
import { primaryDarker, secondary } from "../resources/colors";
import Icon from "../components/Icon.vue";
import { storeToRefs } from "pinia";
import Slider from "../components/Slider.vue";
import { SETTINGS_CATEGORY, settingsCategories } from "../resources/settings/vos";
import { UnsubscribeCallback } from "../utils/classes/Subscribable";
import TogglableNavbar from "../components/TogglableNavbar.vue";
import SettingsItem from "../resources/settings/SettingsItem.vue";
import { useGameFieldStore } from "../resources/field/store";

const router = useRouter();

const active = ref(false);
setTimeout(() => (active.value = true), 250); // ew

const {
  keyBindings4k,
  keyBindings7k,
  backgroundBlur,
  backgroundOpacity,
  masterVolume,
  scrollSpeed,
  globalOffset,
  hitKeyHeight,
  columnWidth,
} = storeToRefs(useSettingsStore());

const { DURATION } = storeToRefs(useGameFieldStore());

const audioStream = inject("audioStream", ref(new AudioStream()));

const audioGraphNodes: AudioGraphNode<BiquadFilterNode>[] = [];

let unsubscribeFromAudioStream: null | UnsubscribeCallback = null;

const selectedCategory = ref<SETTINGS_CATEGORY>(SETTINGS_CATEGORY.INPUT);

const onUpdateGraph = (graph: AudioGraphI) => {
  const transformer = audioStream.value.context.createBiquadFilter();
  transformer.type = "lowpass";

  const audioGraphNode = AudioGraphUtils.insertNodeBetween(
    new AudioGraphNode(transformer),
    graph.output.inbounds[0],
    graph.output,
  );

  audioGraphNodes.push(audioGraphNode);
  if (audioGraphNodes.length > 2) audioGraphNodes.shift();
};

watch(
  audioStream,
  (value) => {
    value.currentGraphs.forEach(onUpdateGraph);
    unsubscribeFromAudioStream = value.subscribe("update:graphs", onUpdateGraph);
  },
  { immediate: true },
);

useKey("Escape", { on_key_up: () => (active.value = false) });

watch(active, (_active) => {
  if (!_active) setTimeout(() => router.replace({ name: ROUTE.HOME }), 250); // ew
});

onUnmounted(() => {
  unsubscribeFromAudioStream?.();
  audioGraphNodes.forEach((node) => AudioGraphUtils.removeNode(node, { inbound: 0, outbound: 0 }));
});
</script>

<template>
  <TogglableNavbar v-model="active">
    <div class="settings-content">
      <section class="settings-category-list">
        <h5 class="settings-title">SETTINGS</h5>

        <button
          v-for="category of settingsCategories"
          :key="category.value"
          class="settings-category-item text-lg"
          :data-active="category.value === selectedCategory"
          @click="selectedCategory = category.value"
        >
          <Icon :icon="category.icon" size="36px" />
          <span>{{ category.title }}</span>
        </button>
      </section>

      <section class="settings-category-selected">
        <h6 class="title">{{ settingsCategories[selectedCategory].title }}</h6>

        <template v-if="selectedCategory === SETTINGS_CATEGORY.INPUT">
          <SettingsItem>
            <template #title>Key bindings [4K]</template>

            <OtpInput
              v-model="keyBindings4k"
              length="4"
              lazy
              font-size="1.33rem"
              :color="secondary.toString()"
            />
          </SettingsItem>

          <SettingsItem>
            <template #title>Key bindings [7K]</template>

            <OtpInput
              v-model="keyBindings7k"
              length="7"
              lazy
              font-size="1.33rem"
              :color="secondary.toString()"
            />
          </SettingsItem>
        </template>

        <template v-if="selectedCategory === SETTINGS_CATEGORY.AUDIO">
          <SettingsItem>
            <template #title>Master volume</template>

            <Slider
              v-model="masterVolume"
              :min="0"
              show-value-hints
              :color="secondary.toString()"
              :bg-color="primaryDarker.toString()"
            />
          </SettingsItem>

          <SettingsItem>
            <template #title>Global offset</template>

            <template #subtitle>
              You can use
              <a href="https://nullvoxpopuli.github.io/latency-tester" target="_blank"
                >this latency tester</a
              >
              to know what your offset should be set to.
            </template>

            <Slider
              v-model="globalOffset"
              :min="-300"
              :max="300"
              unit="ms"
              show-value-hints
              :color="secondary.toString()"
              :bg-color="primaryDarker.toString()"
            />
          </SettingsItem>
        </template>

        <template v-if="selectedCategory === SETTINGS_CATEGORY.GAMEPLAY">
          <SettingsItem>
            <template #title>Scroll speed</template>

            <!-- TODO: scroll speeds below ~15 are bugged for the first notes of the beatmap -->
            <Slider
              v-model="scrollSpeed"
              :min="15"
              :max="40"
              :step="0.1"
              show-value-hints
              :color="secondary.toString()"
              :bg-color="primaryDarker.toString()"
            >
              <template #mouse-overlay="{ value }">
                {{ value }} ({{ Math.floor(DURATION) }}ms)
              </template>
            </Slider>
          </SettingsItem>

          <SettingsItem>
            <template #title>Column width</template>

            <Slider
              v-model="columnWidth"
              :min="70"
              :max="150"
              :step="1"
              unit="px"
              show-value-hints
              :color="secondary.toString()"
              :bg-color="primaryDarker.toString()"
            />
          </SettingsItem>

          <SettingsItem>
            <template #title>Hit position</template>

            <Slider
              v-model="hitKeyHeight"
              :min="100"
              :max="500"
              :step="1"
              unit="px"
              show-value-hints
              :color="secondary.toString()"
              :bg-color="primaryDarker.toString()"
            />
          </SettingsItem>

          <SettingsItem>
            <template #title>Background opacity</template>

            <Slider
              v-model="backgroundOpacity"
              :min="0"
              :max="1"
              :step="0.01"
              :color="secondary.toString()"
              :bg-color="primaryDarker.toString()"
            />
          </SettingsItem>

          <SettingsItem>
            <template #title>Background blur</template>

            <Slider
              v-model="backgroundBlur"
              :min="0"
              :max="12"
              :color="secondary.toString()"
              :bg-color="primaryDarker.toString()"
            />
          </SettingsItem>
        </template>

        <!-- <template v-if="selectedCategory === SETTINGS_CATEGORY.GENERAL">
          <div>
            <p>Show fps counter</p>
          </div>
        </template> -->
      </section>
    </div>
  </TogglableNavbar>
</template>

<style scoped>
.settings-content {
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 300px 500px;
  border-radius: inherit;
}

.settings-title {
  margin: 0;
  margin-bottom: 1rem;
  font-size: 2rem;
  line-height: 1.45;
  letter-spacing: 0.05rem;
}

.settings-category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease-in-out;
  height: 50px;
  position: relative;

  &[data-active="true"] {
    background-color: var(--primary-lighter);
  }

  &:not([data-active="true"]):hover {
    transform: scale(1.05);
  }
}

.settings-category-list {
  background-color: var(--primary-darker);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.settings-category-selected {
  background-color: var(--primary);
  border-radius: inherit;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .title {
    margin: 0;
    margin-bottom: 1rem;
    font-size: 1.85rem;
    line-height: 1.25;
    letter-spacing: 0.03rem;
  }
}
</style>
