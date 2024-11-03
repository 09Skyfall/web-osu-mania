<script setup lang="ts">
// https://iconify.design/docs/api/icon-data.html

import { useAsyncComputed } from "../composables/useAsyncComputed";

const p = defineProps<{ icon: string; size: string }>();

const { value: IconComponent } = useAsyncComputed(
  null,
  async () => (await import(`../../assets/icons/${p.icon}.svg?component`)).default,
);
</script>

<template>
  <IconComponent class="icon" />
</template>

<style scoped>
.icon {
  font-size: v-bind('p.size')
}
</style>