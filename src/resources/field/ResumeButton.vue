<script setup lang="ts">
import Button from "../../components/Button.vue";
import { success } from "../colors";
import { storeToRefs } from "pinia";
import { GAME_STATE, useGameFieldStore } from "./store";

const { gameState } = storeToRefs(useGameFieldStore());

const onResume = () => (gameState.value = GAME_STATE.RUNNING);
</script>

<template>
  <Button :color="success" @click="onResume">Resume</Button>
</template>
