<script setup lang="ts" generic="T">
import { uniqueId } from "lodash";
import { useParabolicList } from "../composables/useParabolicList";

const p = withDefaults(
  defineProps<{
    items: T[];
    bouncy?: boolean;
    parabolic?: boolean;
    tag?: string;
  }>(),
  { tag: "ul" },
);

const uid = uniqueId("list-");

if (p.parabolic) useParabolicList(`#${uid}`, { baseWidth: 1000, factor: 3 });
</script>

<template>
  <component
    :is="tag"
    :id="uid"
    :class="[{ list__bouncy: bouncy, list__parabolic: parabolic }, 'list__base']"
  >
    <div class="list__top-bouncer" v-if="bouncy" />

    <slot v-for="(item, i) of items" :key="i" name="item" v-bind="{ item, i }" />

    <div class="list__bottom-bouncer" v-if="bouncy" />
  </component>
</template>

<style scoped>
.list__base {
  overflow-y: auto;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.list__bouncy {
  scroll-snap-type: y mandatory;
}

.list__bottom-bouncer,
.list__top-bouncer {
  min-height: calc(50% + 1px);
}

.list__base.list__bouncy > *:not(.list__bottom-bouncer, .list__top-bouncer) {
  scroll-snap-align: center;
}
</style>
