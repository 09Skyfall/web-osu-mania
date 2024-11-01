<script lang="ts" setup>
import { computed, ref } from "vue";
import { Timer } from "../../utils/Timer";
import { forEachRight } from "lodash";
import { CanvasNote } from "../note/store";
import { useGameFieldStore } from "./store";
import { storeToRefs } from "pinia";
import { AnimateFunction, useAnimate } from "../../composables/useAnimate";
import { BeatmapLevel } from "../beatmap/store";
import { getColumnColor } from "../column/store";
import HitKey from "../../components/HitKey.vue";
import Column from "../column/Column.vue";
import { useAutoPlay } from "../mods/useAutoPlay";

const p = defineProps<{ level: BeatmapLevel }>();

const { COL_HEIGHT, DURATION } = storeToRefs(useGameFieldStore());
const { keyBindings } = useGameFieldStore();
const { hit: autoHit } = useAutoPlay();

const columns = ref<InstanceType<typeof Column>[]>([]);
const hitKeys = computed(() => (p.level ? (keyBindings.get(p.level.keyMode) ?? []) : []));

const timer = new Timer();

const start: AnimateFunction = (delta_t) => {
  if (!timer.started) timer.start();

  const now = timer.elapsed;

  columns.value.forEach((column, i) => {
    column.canvas.reset();

    if (!column.done && column.nextNote && column.nextNote.hit_t <= now + DURATION.value) {
      const { type, hit_t } = column.nextNote;

      /**
       * @doc Potrebbe succedere che all'inizio della mappa le prime note abbiano un hit_t
       * tale per cui hit_t << DURATION.
       * Due opzioni -> far partire il timer in anticipo (p.notes[currentNote].hit_t <= timer.elapsed - p.startDelay + DURATION.value)
       *                dove startDelay = Math.max(0, ...firstNotes.map((note) => DURATION.value - note.hit_t)).
       *                Così facendo dovrei anche far partire la canzone con startDelay ritardo
       *             -> Calcolare la posizione y della nuova nota da inserire tale per cui non arrivi in ritardo alla fine del field.
       *                duration/col_height = (duration - hit_t)/y ==> y = (duration - hit_t) * col_height / duration
       */
      const y = Math.max((DURATION.value - hit_t) * (COL_HEIGHT.value / DURATION.value), 0);
      const delay = now + DURATION.value - hit_t;
      // duration / col_heght = delay / y ==> y = (col_height * delay) / duration
      const y_offset = (COL_HEIGHT.value * delay) / DURATION.value;

      const canvasNote = new CanvasNote({ y: y + y_offset, type });

      autoHit(canvasNote, hitKeys.value[i]);

      column.push(canvasNote);
    }

    // @doc https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
    forEachRight(column.canvasNotes, (note, i) => {
      const deleted = column.handleNoteDeletion(note, i);
      if (deleted) column.judgeDeletedNote(deleted);
      else column.drawNote(note, i, delta_t);
    });

    column.handleFullscreenNote();
  });
};

const animation = useAnimate([start /* , drawJudgementLines */], {
  animateOnMount: false,
});

const pause = () => {
  timer.pause();
  animation.pause();
};

const resume = () => {
  timer.resume();
  animation.resume();
};

defineExpose({
  play: animation.play,
  stop: animation.stop,
  pause,
  resume,
});
</script>

<template>
  <div class="field">
    <div class="columns-container">
      <Column
        v-for="(hitKey, i) of hitKeys"
        ref="columns"
        :key="i"
        :notes="level.hitObjects[i]"
        :hit-key="hitKey"
        :color="getColumnColor(i, level.keyMode)"
      />
    </div>

    <div class="hit-keys-container">
      <HitKey
        v-for="(hitKey, i) of hitKeys"
        :key="i"
        :hit-key
        :color="getColumnColor(i, level.keyMode)"
      />
    </div>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  background-color: black;
}

.columns-container {
  height: v-bind("`${COL_HEIGHT}px`");
  border-left: 1px solid white;
  border-right: 1px solid white;
}

.hit-keys-container {
  display: flex;
  border-left: 1px solid white;
  border-right: 1px solid white;
}
</style>
