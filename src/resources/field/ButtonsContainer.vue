<script setup lang="ts"></script>

<template>
  <div class="buttons-container">
    <slot />
  </div>
</template>

<style scoped>
.buttons-container {
  width: 100%;
  background-color: #292524;
  margin-bottom: 15rem;

  & > * {
    margin: 2px 0;
  }
}
</style>
