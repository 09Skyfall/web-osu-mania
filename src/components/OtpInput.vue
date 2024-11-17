<script setup lang="ts">
import { range } from "lodash";
import { ref } from "vue";
import { nonNull } from "../utils/assertions/nonNull";
import { primary } from "../resources/colors";

const emit = defineEmits<{ "update:model-value": [value: string[]] }>();

const p = withDefaults(
  defineProps<{
    modelValue: string[];
    length: number | string;
    /** If enabled, the modelValue is updated only after the user finishes typing the whole otp. */
    lazy?: boolean;
    fontSize?: string;
    color?: string;
  }>(),
  {
    fontSize: "1rem",
    color: primary.toString(),
  },
);

const inputs = ref<HTMLInputElement[]>([]);
let selectedInput: HTMLInputElement | null = null;

const onInput = (e: InputEvent, n: number) => {
  if (e.data !== null) inputs.value[n + 1]?.select();

  if (
    !p.lazy ||
    (inputs.value.length === Number(p.length) && inputs.value.every(({ value }) => Boolean(value)))
  ) {
    emit(
      "update:model-value",
      inputs.value.map(({ value }) => value),
    );
  }
};

const onClick = (e: Event) => {
  const input = nonNull(e.target) as HTMLInputElement;

  if (selectedInput === input) return;

  selectedInput = input;
  input.select();
};
</script>

<template>
  <div class="otp-input-keys-container">
    <input
      v-for="n in range(Number(length))"
      ref="inputs"
      :value="modelValue[n]"
      v-bind="$attrs"
      type="text"
      maxlength="1"
      :key="n"
      class="otp-input-key"
      @input="onInput($event as InputEvent, n)"
      @click="onClick($event)"
    />
  </div>
</template>

<style scoped>
.otp-input-keys-container {
  font-size: v-bind("fontSize");
  display: flex;
  gap: 0.33em;
}

.otp-input-key {
  width: v-bind("`calc(${fontSize} * 2)`");
  height: v-bind("`calc(${fontSize} * 2)`");

  text-align: center;
  font-size: inherit;
  text-transform: uppercase;

  padding: 0.5em 0.5em;

  border-radius: 4px;
  border: none;
  background-color: v-bind("color");
  color: white;
  box-shadow:
    inset rgba(0, 0, 0, 0.25) 1px 1px 4px 1px,
    inset rgba(255, 255, 255, 0.8) -1px -1px 4px 1px;

  transition: all 50ms ease-in-out;

  &:focus,
  &:hover {
    outline: none;
    box-shadow:
      inset rgba(255, 255, 255, 0.8) 1px 1px 4px 1px,
      inset rgba(0, 0, 0, 0.25) -1px -1px 4px 1px;
  }
}
</style>
