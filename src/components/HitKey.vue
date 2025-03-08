<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useKey } from "../composables/useKey";
import { RGB } from "../resources/colors/RGB";
import { GAME_STATE, useGameFieldStore } from "../resources/field/store";
import { computed } from "vue";
import { timeoutRef } from "../composables/timeoutRef";
import FadeTransition from "./FadeTransition.vue";

// TODO: spostare componente

const p = defineProps<{ hitKey: string; color: RGB }>();

const { HIT_KEY_HEIGHT, COL_WIDTH, gameState } = storeToRefs(useGameFieldStore());

const { active } = useKey(p.hitKey);
const hitKeyLabel = timeoutRef(p.hitKey, 3000);

const disabled = computed(() => gameState.value === GAME_STATE.PAUSED);
</script>

<template>
  <button :active :disabled class="hit-key">
    <FadeTransition :duration="1000">
      <span v-if="hitKeyLabel">{{ hitKeyLabel }}</span>
    </FadeTransition>
  </button>
</template>

<style scoped>
.hit-key {
  cursor: pointer;
  background: linear-gradient(white, transparent 10%);
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  padding: 0;
  position: relative;
  height: v-bind("`${HIT_KEY_HEIGHT}px`");
  width: v-bind("`${COL_WIDTH}px`");

  &:not([disabled])[active="true"]::before {
    position: absolute;
    width: 0;
    height: 500%;
    transform: translateY(-60%);
    content: "";
    background: linear-gradient(
      transparent,
      rgba(v-bind("color.r"), v-bind("color.g"), v-bind("color.b"), 0.45)
    );
    animation: expand 50ms forwards;
  }

  span {
    font-size: 2.5rem;
    text-transform: uppercase;
  }
}

@keyframes expand {
  from {
    width: 0;
  }
  to {
    width: 90%;
  }
}
</style>
