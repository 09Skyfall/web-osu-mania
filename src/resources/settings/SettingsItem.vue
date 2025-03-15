<script setup lang="ts">
import { useSlots } from "vue";

const slots = useSlots();
</script>

<template>
  <div>
    <p>
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

  &:last-of-type {
    margin-bottom: 0.5rem;
  }
}
</style>
