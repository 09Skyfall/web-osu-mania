<script setup lang="ts">
withDefaults(defineProps<{ duration?: number }>(), { duration: 250 });
</script>

<template>
  <Transition name="expand-x">
    <slot />
  </Transition>
</template>

<style scoped>
.expand-x-enter-active,
.expand-x-leave-active {
  transition: width v-bind("`${duration}ms`") ease-in-out;
}

.expand-x-enter-from,
.expand-x-leave-to {
  width: 0;
}
</style>
