<script setup lang="ts">
defineProps<{ width?: string; height?: string }>();
</script>

<template>
  <div class="__spacer" />
</template>

<style scoped>
.__spacer {
  width: v-bind("width");
  height: v-bind("height");
}
</style>
