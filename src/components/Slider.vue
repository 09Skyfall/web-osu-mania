<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { primary } from "../resources/colors";
import { useEventListener } from "../composables/useEventListener";
import { clamp, uniqueId } from "lodash";
import { assert } from "../utils/assertions/assert";
import { useMouse } from "../composables/useMouse";
import MouseOverlay from "./MouseOverlay.vue";
import { useHover } from "../composables/useHover";

const emit = defineEmits<{ "update:model-value": [value: number] }>();

const p = withDefaults(
  defineProps<{
    height?: string;
    width?: string;
    color?: string;
    bgColor?: string;
    min?: number;
    max?: number;
    step?: number;
    modelValue?: number;
  }>(),
  {
    height: "20px",
    width: "100%",
    color: primary.toString(),
    bgColor: "#e5e5e5",
    min: 1,
    max: 100,
    step: 1,
  },
);

const value = ref(p.modelValue ?? p.min);

const dragging = ref(false);

const sliderId = uniqueId("slider-");
const sliderRect = shallowRef<DOMRect>();

const sliderThumbId = uniqueId("slider-thumb-");
const thumbLeft = computed(() => {
  const x = ((value.value - p.min) / (p.max - p.min)) * (sliderRect.value?.width ?? 0);
  return `clamp(0px, calc(${x}px - (${p.height} / 2)), calc(${p.width} - ${p.height}))`;
});

const progressWidth = computed(() => `calc(${thumbLeft.value} + ${p.height})`);

const round = (number: number, step: number) =>
  Number((Math.round(number / step) * step).toPrecision(2));

const onResize = ([entry]: [ResizeObserverEntry]) => {
  sliderRect.value = entry.target.getBoundingClientRect();
};

const onMouseMove = (e: MouseEvent) => {
  if (!dragging.value) return;
  updateValue(e);
};

useMouse({ on_mouse_move: onMouseMove });

const { hovering } = useHover(`#${sliderThumbId}`);

const updateValue = (e: MouseEvent) => {
  assert(sliderRect.value);

  const { left, right } = sliderRect.value;
  const thumbX = clamp(e.clientX, left, right) - left; // project value to range [0, sliderWidth];

  value.value = round((thumbX / sliderRect.value.width) * (p.max - p.min) + p.min, p.step);
};

useEventListener(`#${sliderThumbId}`, "mousedown", () => (dragging.value = true));
useEventListener(window, "mouseup", () => (dragging.value = false));

watch(value, (v) => emit("update:model-value", v));
</script>

<template>
  <!-- TODO: aria attributes for sliders -->
  <div class="slider" :id="sliderId" v-resize="onResize" @click="updateValue">
    <div class="thumb" :data-dragging="dragging" :id="sliderThumbId" />
    <div class="progress" />

    <MouseOverlay :active="dragging || hovering">
      <div class="slider-mouse-overlay">
        <slot name="mouse-overlay" v-bind="{ value }">{{ value }}</slot>
      </div>
    </MouseOverlay>
  </div>
</template>

<style scoped>
.slider {
  width: v-bind("width");
  height: v-bind("height");

  border-radius: v-bind("`calc(${height} / 2)`");
  color: v-bind("color");
  background-color: v-bind("bgColor");
  position: relative;

  .thumb {
    width: v-bind("height");
    height: v-bind("height");
    background-color: currentColor;
    border-radius: 50%;
    position: absolute;
    left: v-bind("thumbLeft");
    cursor: pointer;
    z-index: 2;
    box-shadow: rgba(0, 0, 0, 1) -1px 1px 6px -3px;
    transition: transform 250ms ease-in-out;

    &:hover,
    &[data-dragging="true"] {
      transform: scale(1.25);
    }
  }

  .progress {
    position: absolute;
    background-color: currentColor;
    width: v-bind("progressWidth");
    border-radius: inherit;
    height: 100%;
  }
}

.slider-mouse-overlay {
  padding: 0.5rem 1rem;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
}
</style>
