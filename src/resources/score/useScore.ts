import { MaybeRefOrGetter, ref, toValue } from "vue";
import { type Judgement } from "../judgement/store";
import { useScoreStore } from "./store";
import { clamp } from "lodash";

/**
 * https://osu.ppy.sh/wiki/en/Gameplay/Score/ScoreV1/osu%21mania
 */

export const useScore = (totalNotes: MaybeRefOrGetter<number>) => {
  const {
    judgementScores,
    MAX_SCORE,
    MOD_DIVIDER,
    MOD_MULTIPLIER,
    MAX_BONUS,
    MIN_BONUS,
  } = useScoreStore();
  const score = ref(0);
  let bonus = MAX_BONUS;

  const calculateBaseScore = (j: Judgement) => {
    return (
      ((MAX_SCORE * MOD_MULTIPLIER * 0.5) / toValue(totalNotes)) *
      (judgementScores[j].hitValue / 320)
    );
  };

  const calculateBonusScore = (j: Judgement) => {
    const { hitBonus, hitPunishment, hitBonusValue } = judgementScores[j];
    bonus = clamp(
      bonus + hitBonus - hitPunishment / MOD_DIVIDER,
      MIN_BONUS,
      MAX_BONUS,
    );
    return (
      ((MAX_SCORE * MOD_MULTIPLIER * 0.5) / toValue(totalNotes)) *
      ((hitBonusValue * Math.sqrt(bonus)) / 320)
    );
  };

  const calculateScore = (j: Judgement) => {
    return calculateBaseScore(j) + calculateBonusScore(j);
  };

  const update = (j: Judgement) => (score.value += calculateScore(j));

  return { score, update };
};
