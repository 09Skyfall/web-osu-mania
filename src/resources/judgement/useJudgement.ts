import { computed, watch, type Ref } from "vue";
import { inRange, mapValues } from "lodash";
import { type Judgement, JUDGEMENT_WINDOWS } from "./store";
import { CanvasNote, NOTE_TYPE } from "../note/store";
import { judgementService } from "./JudgementService";
import { GAME_STATE, useGameFieldStore } from "../field/store";
import { storeToRefs } from "pinia";
import { useKey } from "../../composables/useKey";
import { assert } from "../../utils/assertions/assert";
import { nonNull } from "../../utils/assertions/nonNull";

export const useJudgement = (notes: Ref<CanvasNote[]>, key: string) => {
  const { COL_HEIGHT, VELOCITY, gameState, timer } = storeToRefs(useGameFieldStore());

  const { active } = useKey(key); // TODO: aggiungere stato di pausa

  // TODO: potrebbe essere un composable JudgementWindows da passare come parametro a Judgement
  const windows = computed(() =>
    mapValues(JUDGEMENT_WINDOWS, (jw) => ({
      top: COL_HEIGHT.value - (VELOCITY.value * jw) / 2,
      bottom: COL_HEIGHT.value + (VELOCITY.value * jw) / 2,
    })),
  );

  // internal state
  let judgingLongNote = false;
  let earlyRelease = false;

  const judgeDeletedNote = (note: CanvasNote) => {
    if (note.judged) return;

    if (note.type === NOTE_TYPE.HEAD) judgingLongNote = true;
    else if (note.type === NOTE_TYPE.TAIL) judgingLongNote = false;
    judge(note);
  };

  const onKeyPress = (pressed: boolean) => {
    if (gameState.value === GAME_STATE.PAUSED) return;

    const toBeJudged = notes.value.find(
      (note) =>
        !note.judged && inRange(note.y, windows.value.MISS.top, windows.value.MISS.bottom + 1),
    );

    if (pressed) {
      if (!toBeJudged) return;
      if (toBeJudged.type === NOTE_TYPE.HEAD) judgingLongNote = true;
      judge(toBeJudged);
    } else if (!pressed && judgingLongNote) {
      if (toBeJudged) {
        assert(toBeJudged.type === NOTE_TYPE.TAIL, "Expected note to be of type TAIL");
        judge(toBeJudged);
      } else {
        earlyRelease = true;
      }
    }
  };

  const judge = (note: CanvasNote) => {
    let judgement =
      (Object.keys(windows.value) as Judgement[]).find((jw) =>
        inRange(note.y, windows.value[jw].top, windows.value[jw].bottom + 1),
      ) ?? "MISS";

    if (note.type === NOTE_TYPE.TAIL) judgingLongNote = false;

    if (note.type === NOTE_TYPE.TAIL && earlyRelease) {
      earlyRelease = false;
      judgement = judgement === "MISS" ? "MISS" : "MEH";
    }

    judgementService.publish("add", {
      judgement,
      note_hit_t: note.hit_t,
      timestamp: nonNull(timer.value).elapsed,
    });

    note.judged = true;
  };

  watch(active, onKeyPress);

  return { judgeDeletedNote };
};
