<script lang="ts" setup>
import { computed } from "vue";

const p = withDefaults(defineProps<{ src?: string; blur?: string; opacity?: string | number }>(), {
  opacity: 1,
  blur: "6px",
});

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
  filter: blur(v-bind("blur")) opacity(v-bind("opacity"));
  background-size: cover;
  background-image: v-bind("backgroundImage");
  /* transition: background-image 250ms; */
  z-index: -1;
}
</style>
