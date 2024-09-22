<script lang="ts" setup>
import { watch } from "vue";
import { useKey } from "../composables/useKey";

const emit = defineEmits(["update:model-value"]);
const p = defineProps<{ hitKey: string; disabled?: boolean }>();

// todo: creare un mapping per i vari tasti?
const { active } = useKey(`Key${p.hitKey.toUpperCase()}`);

watch(active, (v) => {
  if (p.disabled) return;
  emit("update:model-value", v);
});
</script>

<template>
  <button :active :disabled class="hit-key" />
</template>

<style scoped>
.hit-key {
  cursor: pointer;
  background-color: transparent;
  border: 1px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hit-key:not([disabled])[active="true"]:before {
  content: "";
  background-color: white;
  width: 60%;
  height: 70%;
  border-radius: 8px;
}
</style>
