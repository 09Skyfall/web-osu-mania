<script lang="ts" setup>
import { ref } from "vue";
import { Timer } from "../../utils/Timer";
import HitKey from "../../components/HitKey.vue";
import { assert } from "../../utils/assertions";
import { forEachRight } from "lodash";
import { useJudgement } from "../judgement/useJudgement";
import {
  CanvasAnimationFunction,
  useCanvasAnimation,
} from "../../composables/useCanvasAnimation";
import { CanvasNote, Note, NOTE_TYPE } from "../note/store";
import { useGameFieldStore } from "../field/store";
import { storeToRefs } from "pinia";
import { useCanvas } from "../../composables/useCanvas";

const p = defineProps<{
  notes: Note[];
  hitKey: string;
}>();

const { SCROLL_SPEED, HIT_KEY_HEIGHT, COL_HEIGHT, COL_WIDTH, DURATION } =
  storeToRefs(useGameFieldStore());

const { canvas, ctx: canvasContext } = useCanvas();

const canvas_notes = ref<CanvasNote[]>([]);
let currentNote = 0;
let isFullscreenNote = false;
let finished = false;
const hitKeyActive = ref(false);
const paused = ref(false);
const timer = new Timer();

const handleNoteDrawing = (note: CanvasNote, i: number, delta_t: number) => {
  assert(canvasContext.value !== undefined);
  note.y += SCROLL_SPEED.value * delta_t;

  switch (note.type) {
    case NOTE_TYPE.HEAD: {
      const tail = canvas_notes.value[i + 1] as CanvasNote | undefined;
      canvasContext.value.fillRect(
        0,
        note.y,
        COL_WIDTH.value,
        (tail?.y ?? 0) - note.y,
      );
      break;
    }
    case NOTE_TYPE.TAIL: {
      const head = canvas_notes.value[i - 1] as CanvasNote | undefined;
      canvasContext.value.fillRect(
        0,
        note.y,
        COL_WIDTH.value,
        (head?.y ?? COL_HEIGHT.value) - note.y,
      );
      break;
    }
    default:
      canvasContext.value.fillRect(0, note.y, COL_WIDTH.value, -25);
  }
};

const handleNoteDeletion = (note: CanvasNote, i: number) => {
  // TODO: calcolare il buffer in base a alla window del judgement
  const BUFFER = 100; /* buffer that leaves the note long enough to compute the judgement */
  if (note.y >= COL_HEIGHT.value + BUFFER) {
    if (
      note.type === NOTE_TYPE.HEAD &&
      canvas_notes.value[i + 1] === undefined
    ) {
      // @doc Se cancello la testa di una longNote ma la tail ancora non è presente nel campo, non ci sarebbe
      // nessuna nota e quindi la longNote non verrebbe renderizzata
      isFullscreenNote = true;
    }
    return canvas_notes.value.splice(i, 1)[0];
  }
};

const handleFullscreenNote = () => {
  assert(canvas_notes.value.length === 0);
  assert(canvasContext.value !== undefined);
  canvasContext.value.fillRect(0, 0, COL_WIDTH.value, COL_HEIGHT.value);
};

const { drawJudgementLines, judgeDeletedNote } = useJudgement(
  canvas_notes,
  hitKeyActive,
  { SCROLL_SPEED, COL_HEIGHT },
);

const start: CanvasAnimationFunction = (ctx, delta_t) => {
  if (!timer.started) {
    timer.start();
    assert(
      p.notes.length > 0,
      "Expected notes to be a non empty array on start",
    );
  }

  if (
    !finished &&
    p.notes[currentNote].hit_t <= timer.elapsed + DURATION.value
  ) {
    const { type, hit_t } = p.notes[currentNote];
    /**
     * @doc Potrebbe succedere che all'inizio della mappa le prime note abbiano un hit_t
     * tale per cui hit_t << DURATION.
     * Due opzioni -> far partire il timer in anticipo (p.notes[currentNote].hit_t <= timer.elapsed - p.startDelay + DURATION.value)
     *                dove startDelay = Math.max(0, ...firstNotes.map((note) => DURATION.value - note.hit_t)).
     *                Così facendo dovrei anche far partire la canzone con startDelay ritardo
     *             -> Calcolare la posizione y della nuova nota da inserire tale per cui non arrivi in ritardo alla fine del field.
     *                duration/col_height = (duration - hit_t)/y ==> y = (duration - hit_t) * col_height / duration
     */
    const y = Math.max(
      (DURATION.value - hit_t) * (COL_HEIGHT.value / DURATION.value),
      0,
    );
    canvas_notes.value.push(new CanvasNote({ y, type }));
    currentNote = Math.min(currentNote + 1, p.notes.length - 1);
    if (currentNote === p.notes.length - 1) finished = true;
  }

  ctx.fillStyle = "white";

  // @doc https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
  forEachRight(canvas_notes.value, (note, i) => {
    const deleted = handleNoteDeletion(note, i);
    if (deleted) judgeDeletedNote(deleted);
    else handleNoteDrawing(note, i, delta_t);
  });

  isFullscreenNote &&= canvas_notes.value.length === 0;
  if (isFullscreenNote) handleFullscreenNote();
};

const {
  play,
  pause: pauseAnimation,
  resume: resumeAnimation,
  stop,
} = useCanvasAnimation(
  canvas,
  { animations: [start, drawJudgementLines] },
  { animateOnMount: false },
);

const pause = () => {
  paused.value = true;
  timer.pause();
  pauseAnimation();
};

const resume = () => {
  paused.value = false;
  timer.resume();
  resumeAnimation();
};

defineExpose({ play, pause, resume, stop });
</script>

<template>
  <div class="wrapper">
    <canvas
      ref="canvas"
      :width="COL_WIDTH"
      :height="COL_HEIGHT"
      class="canvas"
    />
    <hit-key v-model="hitKeyActive" :disabled="paused" :hit-key />
  </div>
</template>

<style scoped>
.canvas {
  border: 1px solid white;
}
.wrapper {
  display: grid;
  grid-template-rows: v-bind("`${COL_HEIGHT}px`") v-bind(
      "`${HIT_KEY_HEIGHT}px`"
    );
}
</style>
