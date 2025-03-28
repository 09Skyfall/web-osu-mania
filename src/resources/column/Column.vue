<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCanvas } from "../../composables/useCanvas";
import { RGB } from "../colors/RGB";
import { useGameFieldStore } from "../field/store";
import { CanvasNote, Note, NOTE_TYPE } from "../note/store";
import { useJudgement } from "../judgement/useJudgement";
import { ref } from "vue";
import { assert } from "../../utils/assertions/assert";
import { nonNull } from "../../utils/assertions/nonNull";
import { NOTE_HEIGHT } from "./store";
import { JUDGEMENT_WINDOWS } from "../judgement/store";

// TODO: rename column entity to fieldColumn ?

const p = withDefaults(defineProps<{ notes: Note[]; hitKey: string; color?: RGB }>(), {
  color: () => new RGB(255, 255, 255),
});

const { COL_HEIGHT, COL_WIDTH, VELOCITY } = storeToRefs(useGameFieldStore());

const { canvas, ctx: canvasContext } = useCanvas({ alpha: false });

const canvasNotes = ref<CanvasNote[]>([]);

let isFullscreenNote = false;
let done = false;
let currentNote = 0;

const { judgeDeletedNote } = useJudgement(canvasNotes, p.hitKey);

const drawNote = (note: CanvasNote, i: number, delta_t: number) => {
  assert(canvasContext.value);

  canvasContext.value.fillStyle = p.color.toString();

  note.y += VELOCITY.value * delta_t;

  switch (note.type) {
    case NOTE_TYPE.HEAD: {
      const tail = canvasNotes.value[i + 1] as CanvasNote | undefined;
      canvasContext.value.fillRect(0, note.y, COL_WIDTH.value, (tail?.y ?? 0) - note.y);
      break;
    }

    case NOTE_TYPE.TAIL: {
      const head = canvasNotes.value[i - 1] as CanvasNote | undefined;
      canvasContext.value.fillRect(
        0,
        note.y - NOTE_HEIGHT,
        COL_WIDTH.value,
        (head?.y ?? COL_HEIGHT.value) - note.y + NOTE_HEIGHT,
      );
      break;
    }

    default:
      canvasContext.value.fillRect(0, note.y, COL_WIDTH.value, -NOTE_HEIGHT);
  }
};

const handleNoteDeletion = (note: CanvasNote, i: number) => {
  if (note.y > COL_HEIGHT.value + (VELOCITY.value * JUDGEMENT_WINDOWS["MISS"]) / 2) {
    if (note.type === NOTE_TYPE.HEAD && canvasNotes.value[i + 1] === undefined) {
      // @doc Se cancello la testa di una longNote ma la tail ancora non è presente nel campo, non ci sarebbe
      // nessuna nota e quindi la longNote non verrebbe renderizzata
      isFullscreenNote = true;
    }
    return canvasNotes.value.splice(i, 1)[0];
  }
};

const handleFullscreenNote = () => {
  isFullscreenNote &&= canvasNotes.value.length === 0;

  if (isFullscreenNote) {
    assert(canvasContext.value);
    canvasContext.value.fillStyle = p.color.toString();
    canvasContext.value.fillRect(0, 0, COL_WIDTH.value, COL_HEIGHT.value);
  }
};

const push = (note: CanvasNote) => {
  canvasNotes.value.push(note);

  currentNote++;

  if (currentNote === p.notes.length) done = true;
};

const getNextNote = (): Note | undefined => {
  if (currentNote >= p.notes.length) return undefined;
  return p.notes[currentNote];
};

defineExpose({
  drawNote,
  handleNoteDeletion,
  handleFullscreenNote,
  judgeDeletedNote,
  push,
  get canvas() {
    return nonNull(canvasContext.value);
  },
  get done() {
    return done;
  },
  get nextNote() {
    return getNextNote();
  },
  get canvasNotes() {
    return canvasNotes.value;
  },
});
</script>

<template>
  <canvas ref="canvas" :width="COL_WIDTH" :height="COL_HEIGHT" />
</template>
