<script setup lang="ts">
import { useSlots } from "vue";

const slots = useSlots();
</script>

<template>
  <div>
    <p class="__settings_item-title">
      <slot name="title" />
    </p>

    <p class="text-sm" v-if="slots.subtitle">
      <slot name="subtitle" />
    </p>

    <slot />
  </div>
</template>

<style scoped>
p {
  margin: 0;
  margin-bottom: 0.25rem;

  &:last-of-type {
    margin-bottom: 0.75rem;
  }
}

.__settings_item-title {
  font-weight: 500;
}
</style>
