<script setup lang="ts">
import { computed } from "vue";

const p = withDefaults(
  defineProps<{
    vertical?: boolean;
    modelValue?: string | number;
    min?: string | number;
    max?: string | number;
    bgColor?: string;
    color?: string;
    width?: string;
    length?: string;
  }>(),
  {
    modelValue: 0.5,
    min: 0,
    max: 1,
    bgColor: "transparent",
    color: "white",
    width: "1rem",
    length: "100%",
  },
);

const percentage = computed(
  () =>
    (100 * (Number(p.modelValue) - Number(p.min))) /
    (Number(p.max) - Number(p.min)),
);
</script>

<template>
  <div class="bar" />
</template>

<style scoped>
.bar {
  display: flex;

  width: v-bind("vertical ? width : length");
  height: v-bind("vertical ? length : width");

  border: 1px solid white;
  border-radius: 0.5rem;

  overflow: hidden;
  background: v-bind("bgColor");
}

.bar::before {
  content: "";
  align-self: end;
  width: v-bind("vertical ? '100%' : `${percentage}%`");
  height: v-bind("vertical ? `${percentage}%` : '100%'");
  background: v-bind("color");
  transition:
    height 500ms,
    background-color 250ms;
}
</style>
