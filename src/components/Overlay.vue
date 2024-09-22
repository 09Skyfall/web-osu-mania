<script setup lang="ts">
defineProps<{ active: boolean }>();
</script>

<template>
  <Teleport to="body">
    <div v-show="active" class="overlay">
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  z-index: 99999;

  width: 100dvw;
  height: 100dvh;

  background-color: rgba(0, 0, 0, 0.33);
  backdrop-filter: blur(4px);
}
</style>
