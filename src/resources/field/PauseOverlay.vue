<script setup lang="ts">
import Overlay from "../../components/Overlay.vue";

defineProps<{ active: boolean }>();
</script>

<template>
  <Overlay :active>
    <p class="pause-title">PAUSE</p>
  </Overlay>
</template>

<style scoped>
.pause-title {
  font-size: 8rem;
  font-weight: 800;
  text-transform: uppercase;
  color: white;
  letter-spacing: 0.33rem;
  text-align: center;
}
</style>
