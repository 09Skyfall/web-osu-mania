import { computed, watch, type Ref } from "vue";
import { type CanvasAnimationFunction } from "../../composables/useCanvasAnimation";
import { inRange, mapValues, remove } from "lodash";
import { assert } from "../../utils/assertions";
import { type Judgement, JUDGEMENT_WINDOWS } from "./store";
import { CanvasNote, NOTE_TYPE } from "../note/store";
import { judgementService } from "./JudgementService";

type UseJudgementOptions = {
  SCROLL_SPEED: Ref<number>;
  COL_HEIGHT: Ref<number>;
};

export const useJudgement = (
  notes: Ref<CanvasNote[]>,
  keyPressed: Ref<boolean>,
  options: UseJudgementOptions,
) => {
  const { SCROLL_SPEED, COL_HEIGHT } = options;

  const judged: string[] = [];
  const windows = computed(() =>
    mapValues(JUDGEMENT_WINDOWS, (jw) => ({
      top: COL_HEIGHT.value - (SCROLL_SPEED.value * jw) / 2,
      bottom: COL_HEIGHT.value + (SCROLL_SPEED.value * jw) / 2,
    })),
  );

  // internal state
  let judgingLongNote = false;
  let earlyRelease = false;

  const drawJudgementLines: CanvasAnimationFunction = (ctx) => {
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

  const onKeyPressChange = (pressed: boolean) => {
    const toBeJudged = notes.value
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
        inRange(note.y, windows.value[jw].top, windows.value[jw].bottom),
      );
      assert(jw, "expected judgement window to not be undefined");
      judgementService.add(jw);
      judged.push(note.id);
    }
  };

  watch(keyPressed, onKeyPressChange);

  return { drawJudgementLines, judgeDeletedNote, windows };
};
