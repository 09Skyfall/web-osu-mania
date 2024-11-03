<script setup lang="ts">
import { useRouter } from "vue-router";
import Button from "../../components/Button.vue";
import { ROUTE } from "../../plugins/router";
import { error } from "../colors";

const router = useRouter();

const onQuit = () => router.push({ name: ROUTE.HOME });
</script>

<template>
  <Button :color="error" @click="onQuit">Quit</Button>
</template>
