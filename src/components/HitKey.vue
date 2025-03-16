<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useKey } from "../composables/useKey";
import { RGB } from "../resources/colors/RGB";
import { GAME_STATE, useGameFieldStore } from "../resources/field/store";
import { computed } from "vue";
import { timeoutRef } from "../composables/timeoutRef";
import FadeTransition from "./FadeTransition.vue";
import { NOTE_HEIGHT } from "../resources/column/store";

// TODO: spostare componente

const p = defineProps<{ hitKey: string; color: RGB }>();

const { HIT_KEY_HEIGHT, COL_WIDTH, gameState } = storeToRefs(useGameFieldStore());
const { LEAD_IN_TIME } = useGameFieldStore();

const { active } = useKey(p.hitKey);
const hitKeyLabel = timeoutRef(p.hitKey, LEAD_IN_TIME);

const disabled = computed(() => gameState.value === GAME_STATE.PAUSED);
</script>

<template>
  <button :active :disabled class="__hit_key">
    <div class="__hit_key-judgement-line-hint" />

    <div class="__hit_key-active-hint">
      <FadeTransition :duration="1000">
        <div v-if="hitKeyLabel" class="__hit_key-key-hint">{{ hitKeyLabel }}</div>
      </FadeTransition>
    </div>
  </button>
</template>

<style scoped>
.__hit_key {
  /* background: linear-gradient(white, transparent 10%); */
  border: none;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: v-bind("`${HIT_KEY_HEIGHT}px`");
  width: v-bind("`${COL_WIDTH}px`");

  .__hit_key-judgement-line-hint {
    position: absolute;
    top: 0;
    translate: 0 -100%;
    height: v-bind("`${NOTE_HEIGHT}px`");
    width: 100%;
    border-top: 1px solid white;
    border-bottom: 1px solid white;
  }

  .__hit_key-active-hint {
    width: 30px;
    height: 30px;
    margin: 25px auto;
    border-radius: 100%;
  }

  &:not([disabled])[active="true"] {
    .__hit_key-active-hint {
      transition: background-color 100ms ease-out;
      background-color: v-bind("color.toString()");
    }

    &::before {
      position: absolute;
      width: 0;
      height: 500px;
      translate: 0 -100%;
      top: 0;
      content: "";
      background: linear-gradient(
        transparent,
        rgba(v-bind("color.r"), v-bind("color.g"), v-bind("color.b"), 0.45)
      );
      animation: expand 50ms forwards;
    }
  }

  .__hit_key-key-hint {
    font-size: 2.5rem;
    text-transform: uppercase;
    position: absolute;
    top: v-bind("`-${NOTE_HEIGHT}px`");
    translate: 0 -100%;
    left: 0;
    width: 100%;
    text-shadow:
      black -1px -1px,
      black -1px 1px,
      black 1px 1px,
      black 1px -1px;
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
