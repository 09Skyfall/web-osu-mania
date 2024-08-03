<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Timer } from '../../utils/Timer';
import HitKey from '../../components/HitKey.vue';
import { assert } from '../../utils/assert';
import { forEachRight, inRange } from 'lodash';
import { useJudgement } from '../judgement/useJudgement';
import { CanvasAnimationFunction, useCanvasAnimation } from '../../composables/useCanvasAnimation';
import { CanvasNote, Note, NOTE_TYPE } from '../note/store';

const p = defineProps<{
  height: number,
  width: number,
  notes: Note[],
  hitKey: string
}>()

const SCROLL_SPEED = 1.85 // px/ms
const HIT_KEY_HEIGHT = 100 // px
const COL_HEIGHT = computed(() => p.height - HIT_KEY_HEIGHT) // px
const DURATION = computed(() => COL_HEIGHT.value / SCROLL_SPEED) // ms
// should be computed accordingly: per esempio se la SS è molto bassa, potrebbe succede che
// la duration sia > del hit_t della prima nota
const START_DELAY = 0 // ms

const canvas = ref<HTMLCanvasElement | null>(null)
const canvasContext = computed(() => canvas.value?.getContext("2d") ?? undefined)

const canvas_notes = ref<CanvasNote[]>([])
let isFullscreenNote = false
const active = ref(false)
const timer = new Timer()

const handleNoteDrawing = (note: CanvasNote, i: number, delta_t: number) => {
  assert(canvasContext.value !== undefined)
  note.y += COL_HEIGHT.value / /* fps */ ((1000) / delta_t) * SCROLL_SPEED

  switch (note.type) {
    case NOTE_TYPE.HEAD: {
      const tail = canvas_notes.value[i + 1] as CanvasNote | undefined
      canvasContext.value.fillRect(0, note.y, 100, (tail?.y ?? 0) - note.y)
      break;
    }
    case NOTE_TYPE.TAIL: {
      const head = canvas_notes.value[i - 1] as CanvasNote | undefined
      canvasContext.value.fillRect(0, note.y, 100, (head?.y ?? COL_HEIGHT.value) - note.y)
      break;
    }
    default: canvasContext.value.fillRect(0, note.y, 100, -25)
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
  canvasContext.value.fillRect(0, 0, 100, COL_HEIGHT.value)
}

const { drawJudgementLines, judgeDeletedNote } = useJudgement(canvas_notes, active, { SCROLL_SPEED, COL_HEIGHT: COL_HEIGHT.value })

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
    <canvas ref="canvas" :width :height="COL_HEIGHT" class="canvas" />
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