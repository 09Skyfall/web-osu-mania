<script setup lang="ts">
withDefaults(defineProps<{ duration?: number }>(), { duration: 250 });
</script>

<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind("`${duration}ms`") ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
