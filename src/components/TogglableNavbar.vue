<script setup lang="ts">
import { primary } from "../resources/colors";
import { RGB } from "../resources/colors/RGB";
import ExpandXTransition from "./ExpandXTransition.vue";
import Icon from "./Icon.vue";

const emit = defineEmits<{ "update:model-value": [modelValue: boolean] }>();
// TODO: elevation?: string | number;
withDefaults(defineProps<{ color?: RGB; modelValue: boolean }>(), { color: () => primary });
</script>

<template>
  <ExpandXTransition>
    <aside v-if="modelValue" :active="modelValue">
      <div class="navbar-content">
        <slot />
      </div>

      <button class="navbar-toggle-button" @click="emit('update:model-value', !modelValue)">
        <Icon icon="chevron-right" size="20px" stroke-width="2px" class="chevron-icon" />
      </button>
    </aside>
  </ExpandXTransition>
</template>

<style scoped>
aside {
  position: relative;
  width: 800px;
  height: 100dvh;

  border-radius: 0 16px 16px 0;
  background-color: v-bind("color.toString()");
  box-shadow: v-bind("color.toString()") 2px 0 6px -2px;

  > .navbar-content {
    background-color: inherit;
    border-radius: inherit;
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
  }

  .navbar-toggle-button {
    background-color: inherit;
    border-radius: inherit;
    box-shadow: inherit;

    position: absolute;
    right: -32px;
    top: 50%;
    transform: translateY(-50%);

    height: 72px;
    width: 32px;
    border-radius: 0 8px 8px 0;

    .chevron-icon {
      transition: 150ms;
    }
  }
}

aside[active="true"] {
  .navbar-toggle-button {
    .chevron-icon {
      transform: rotate(180deg);
    }
  }
}
</style>
