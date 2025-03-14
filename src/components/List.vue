<script setup lang="ts">
import { uniqueId } from "lodash";
import { useParabolicList } from "../composables/useParabolicList";

const p = withDefaults(
  defineProps<{
    parabolic?: boolean;
    tag?: string;
  }>(),
  { tag: "ul" },
);

const uid = uniqueId("list-");

if (p.parabolic) useParabolicList(`#${uid}`, { factor: 8 });
</script>

<template>
  <component :is="tag" :id="uid" :class="[{ list__parabolic: parabolic }, 'list__base']">
    <slot />
  </component>
</template>

<style scoped>
.list__base {
  overflow-y: auto;
  list-style-type: none;
  margin: 0;
  padding: 0;
}
</style>
