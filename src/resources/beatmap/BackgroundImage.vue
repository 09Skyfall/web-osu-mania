<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useSettingsStore } from "../settings/store";

const p = defineProps<{ src?: string }>();

const { backgroundBlur: blur, backgroundOpacity: opacity } = storeToRefs(useSettingsStore());

const backgroundImage = computed(() => `url(${p.src})`);
</script>

<template>
  <div class="background-beatmap-image">
    <slot />
  </div>
</template>

<style scoped>
.background-beatmap-image::before {
  position: fixed;
  width: 100dvw;
  height: 100dvh;
  content: "";
  filter: blur(v-bind("`${blur}px`")) opacity(v-bind("opacity"));
  background-size: cover;
  background-image: v-bind("backgroundImage");
  /* transition: background-image 250ms; */
  z-index: -1;
}
</style>
