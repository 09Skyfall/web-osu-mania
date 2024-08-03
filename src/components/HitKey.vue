<script lang="ts" setup>
import { watch } from 'vue';
import { useKey } from '../composables/useKey';

const emit = defineEmits(["update:model-value"])
const p = defineProps<{ hitKey: string }>()

// todo: creare un mapping per i vari tasti?
const { active } = useKey(`Key${p.hitKey.toUpperCase()}`)

watch(active, (v) => emit("update:model-value", v))
</script>

<template>
  <button :active class="hit-key" />
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
.hit-key[active="true"]:before {
  content: "";
  background-color: white;
  width: 60%;
  height: 70%;
  border-radius: 8px;
}
</style>