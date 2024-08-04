<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Timer } from '../../utils/Timer';
import HitKey from '../../components/HitKey.vue';
import { assert } from '../../utils/assert';
import { forEachRight, inRange } from 'lodash';
import { useJudgement } from '../judgement/useJudgement';
import { CanvasAnimationFunction, useCanvasAnimation } from '../../composables/useCanvasAnimation';
import { CanvasNote, Note, NOTE_TYPE } from '../note/store';
import { useGameFieldStore } from '../field/store';
import { storeToRefs } from 'pinia';
import { useCanvas } from '../../composables/useCanvas';

const p = defineProps<{
  notes: Note[],
  hitKey: string
}>()

const {
  SCROLL_SPEED,
  HIT_KEY_HEIGHT,
  COL_HEIGHT,
  COL_WIDTH,
  DURATION
} = storeToRefs(useGameFieldStore())

const { canvas, ctx: canvasContext } = useCanvas()

const canvas_notes = ref<CanvasNote[]>([])
let isFullscreenNote = false
const active = ref(false)
const timer = new Timer()

const handleNoteDrawing = (note: CanvasNote, i: number, delta_t: number) => {
  assert(canvasContext.value !== undefined)
  note.y += SCROLL_SPEED.value * delta_t

  switch (note.type) {
    case NOTE_TYPE.HEAD: {
      const tail = canvas_notes.value[i + 1] as CanvasNote | undefined
      canvasContext.value.fillRect(0, note.y, COL_WIDTH.value, (tail?.y ?? 0) - note.y)
      break;
    }
    case NOTE_TYPE.TAIL: {
      const head = canvas_notes.value[i - 1] as CanvasNote | undefined
      canvasContext.value.fillRect(0, note.y, COL_WIDTH.value, (head?.y ?? COL_HEIGHT.value) - note.y)
      break;
    }
    default: canvasContext.value.fillRect(0, note.y, COL_WIDTH.value, -25)
  }
}

const handleNoteDeletion = (note: CanvasNote, i: number) => {
  // TODO: calcolare il buffer in base a alla window del judgement
  if (note.y >= COL_HEIGHT.value + 100 /* buffer that leaves the note long enough to compute the judgement */) {
    if (note.type === NOTE_TYPE.HEAD && canvas_notes.value[i + 1] === undefined) {
      // @doc Se cancello la testa di una longNote ma la tail ancora non è presente nel campo, non ci sarebbe
      // nessuna nota e quindi la longNote non verrebbe renderizzata
      isFullscreenNote = true
    }
    return canvas_notes.value.splice(i, 1)[0]
  }
}

const handleFullscreenNote = () => {
  assert(canvas_notes.value.length === 0)
  assert(canvasContext.value !== undefined)
  canvasContext.value.fillRect(0, 0, COL_WIDTH.value, COL_HEIGHT.value)
}

const { drawJudgementLines, judgeDeletedNote } = useJudgement(canvas_notes, active, { SCROLL_SPEED, COL_HEIGHT })

const start: CanvasAnimationFunction = (ctx, delta_t) => {
  if (!timer.started) timer.start()

  if (canvas_notes.value[0]?.y && inRange(canvas_notes.value[0]?.y, COL_HEIGHT.value - 20, COL_HEIGHT.value + 20))
    console.log("stop!", timer.elapsed - START_DELAY)

  // @doc Cosa succede se le prime note hanno hit_t molto minore di timer.elapsed + DURATION ?
  // Potrebbe essere un'idea far partire a -x secondi, per permettere all'utente di "prepararsi"
  if (p.notes.length && p.notes[0].hit_t <= (timer.elapsed - START_DELAY) + DURATION.value) {
    console.log("start!", p.notes.length && p.notes[0].hit_t, timer.elapsed - START_DELAY, DURATION.value)
    // TODO: using shift is probably very slow, should find a queue implementation that does this in O(1)
    // todo: mutating prop not good
    const { type } = p.notes.shift()!
    canvas_notes.value.push(new CanvasNote({ y: 0, type }))
  }

  ctx.fillStyle = "white"

  // @doc https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
  forEachRight(canvas_notes.value, (note, i) => {
    const deleted = handleNoteDeletion(note, i)
    if (deleted) judgeDeletedNote(deleted)
    else handleNoteDrawing(note, i, delta_t)
  })

  isFullscreenNote &&= canvas_notes.value.length === 0
  if (isFullscreenNote) handleFullscreenNote()
}

const { animate: play } = useCanvasAnimation(canvas, { animations: [start, drawJudgementLines] }, { animateOnMount: false })

defineExpose({ play })
</script>

<template>
  <div class="wrapper">
    <canvas ref="canvas" :width="COL_WIDTH" :height="COL_HEIGHT" class="canvas" />
    <hit-key v-model="active" :hit-key /> 
  </div>
</template>

<style scoped>
.canvas {
  border: 1px solid white;
}
.wrapper {
  display: grid;
  grid-template-rows: v-bind('`${COL_HEIGHT}px`') v-bind('`${HIT_KEY_HEIGHT}px`');
}
</style>