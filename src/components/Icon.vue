<script setup lang="ts">
// https://iconify.design/docs/api/icon-data.html

import { useAsyncComputed } from "../composables/useAsyncComputed";

const p = withDefaults(defineProps<{ icon: string; size?: string; color?: string }>(), {
  size: "24px",
  color: "white",
});

const { value: IconComponent } = useAsyncComputed(
  null,
  async () => (await import(`../../assets/icons/${p.icon}.svg?component`)).default,
);
</script>

<template>
  <IconComponent class="base-icon" />
</template>

<style scoped>
.base-icon {
  font-size: v-bind("p.size");
  color: v-bind("p.color");
}
</style>
