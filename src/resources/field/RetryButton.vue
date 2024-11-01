<script setup lang="ts">
import Button from "../../components/Button.vue";
import { warning } from "../colors";

const onRetry = () => location.reload();
</script>

<template>
  <Button :color="warning" @click="onRetry">Retry</Button>
</template>
