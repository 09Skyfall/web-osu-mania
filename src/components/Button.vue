<script setup lang="ts">
import { RGB } from "../resources/colors/RGB";

const p = withDefaults(
  defineProps<{ width?: string; height?: string; color: RGB; glow?: boolean }>(),
  {
    width: "100%",
    height: "80px",
  },
);

const darkenedColor = p.color.multiply(0.7);
</script>

<template>
  <!-- TODO: role button -->
  <div class="button" :class="{ glow }">
    <span>
      <slot />
    </span>
  </div>
</template>

<style scoped>
.button {
  container-type: inline-size;

  position: relative;
  z-index: 0;
  display: grid;
  place-items: center;

  width: v-bind("width");
  height: v-bind("height");

  cursor: pointer;

  &[disabled] {
    cursor: not-allowed;
  }

  &::before {
    content: "";

    position: absolute;
    z-index: -1;

    margin: 0 10%;
    inset: 0;

    background: linear-gradient(
      270deg,
      v-bind("p.color.toString()") 0%,
      v-bind("darkenedColor.toString()") 50%,
      v-bind("p.color.toString()") 100%
    );

    clip-path: polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%);

    transition: transform 150ms;
  }

  &.glow {
    &::after {
      content: "";

      position: absolute;
      z-index: -2;

      inset: 0;
    }

    &:hover::after {
      background: linear-gradient(
        90deg,
        transparent,
        v-bind("p.color.toString()") 20%,
        v-bind("p.color.toString()") 80%,
        transparent
      );
    }
  }

  &:hover {
    &::before {
      background: v-bind("p.color.toString()");
      transform: scaleX(1.05);
    }

    & > span {
      transform: scaleX(1.05);
    }
  }

  & > span {
    font-size: clamp(1rem, 5cqmin, 5cqmin);
    font-weight: 800;
    font-variant: all-small-caps;
    letter-spacing: 0.1rem;
    transition: transform 150ms;
    padding-bottom: 0.5rem;
  }
}
</style>
