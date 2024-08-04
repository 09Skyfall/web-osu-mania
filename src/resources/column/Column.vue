<script lang="ts" setup>
import { ref } from 'vue';
import { Timer } from '../../utils/Timer';
import HitKey from '../../components/HitKey.vue';
import { assert } from '../../utils/assert';
import { forEachRight } from 'lodash';
import { useJudgement } from '../judgement/useJudgement';
import { CanvasAnimationFunction, useCanvasAnimation } from '../../composables/useCanvasAnimation';
import { CanvasNote, Note, NOTE_TYPE } from '../note/store';
import { useGameFieldStore } from '../field/store';
import { storeToRefs } from 'pinia';
import { useCanvas } from '../../composables/useCanvas';

const p = defineProps<{
  notes: Note[],
  hitKey: string,
  startDelay: number,
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
let currentNote = 0
let isFullscreenNote = false
let finished = false
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
  if (!timer.started) {
    timer.start()
    assert(p.notes.length > 0, "Expected notes to be a non empty array on start")
  }

  if (!finished && p.notes[currentNote].hit_t <= (timer.elapsed - p.startDelay) + DURATION.value) {
    const { type } = p.notes[currentNote]
    canvas_notes.value.push(new CanvasNote({ y: 0, type }))
    currentNote = Math.min(currentNote + 1, p.notes.length - 1)
    if (currentNote === p.notes.length - 1) finished = true
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