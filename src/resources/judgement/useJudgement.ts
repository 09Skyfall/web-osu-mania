import { computed, watch, type Ref } from "vue";
import { inRange, mapValues, remove } from "lodash";
import { assert } from "../../utils/assertions";
import { type Judgement, JUDGEMENT_WINDOWS } from "./store";
import { CanvasNote, NOTE_TYPE } from "../note/store";
import { judgementService } from "./JudgementService";
import { GAME_STATE, useGameFieldStore } from "../field/store";
import { storeToRefs } from "pinia";
import { useKey } from "../../composables/useKey";

export const useJudgement = (notes: Ref<CanvasNote[]>, key: string) => {
  const { SCROLL_SPEED, COL_HEIGHT, gameState } = storeToRefs(useGameFieldStore());

  const { active } = useKey(key); // TODO: aggiungere stato di pausa

  const judged: string[] = [];
  // TODO: potrebbe essere un composable JudgementWindows da passare come parametro a Judgement
  const windows = computed(() =>
    mapValues(JUDGEMENT_WINDOWS, (jw) => ({
      top: COL_HEIGHT.value - (SCROLL_SPEED.value * jw) / 2,
      bottom: COL_HEIGHT.value + (SCROLL_SPEED.value * jw) / 2,
    })),
  );

  // internal state
  let judgingLongNote = false;
  let earlyRelease = false;

  // TODO: spostare nel composable usejudgementwindows
  const drawJudgementLines = (ctx) => {
    Object.values(windows.value).forEach(({ top }) => {
      ctx.fillStyle = "red";
      ctx.fillRect(0, top, 100, 1);
    });
  };

  const judgeDeletedNote = (note: CanvasNote) => {
    if (!judged.includes(note.id)) {
      if (note.type === NOTE_TYPE.HEAD) judgingLongNote = true;
      else if (note.type === NOTE_TYPE.TAIL) judgingLongNote = false;
      judge();
    } else {
      remove(judged, (id) => note.id === id);
    }
  };

  const onKeyPress = (pressed: boolean) => {
    if (gameState.value === GAME_STATE.PAUSED) return;

    const toBeJudged = notes.value
      // TODO: trasformare in un'unica find
      .filter((note) => inRange(note.y, windows.value.MISS.top, windows.value.MISS.bottom + 1))
      .find((note) => !judged.includes(note.id));

    if (pressed) {
      if (!toBeJudged) return;
      if (toBeJudged.type === NOTE_TYPE.HEAD) judgingLongNote = true;
      judge(toBeJudged);
    } else if (!pressed && judgingLongNote) {
      if (toBeJudged) {
        assert(toBeJudged.type === NOTE_TYPE.TAIL, "Expected note to be of type TAIL");
        judge(toBeJudged);
      } else {
        // TODO: implement earlyRelease logic (prevents judgements better than MEH for tail note)
        earlyRelease = true;
      }
    }
  };

  const judge = (note?: CanvasNote) => {
    if (!note) {
      // counts as a late miss
      judgementService.add("MISS");
    } else {
      if (note.type === NOTE_TYPE.TAIL) judgingLongNote = false;
      const jw = (Object.keys(windows.value) as Judgement[]).find((jw) =>
        inRange(note.y, windows.value[jw].top, windows.value[jw].bottom + 1),
      );
      assert(jw, "expected judgement window to not be undefined");
      judgementService.add(jw);
      judged.push(note.id);
    }
  };

  watch(active, onKeyPress);

  return { judgeDeletedNote };
};
