import { defineStore } from "pinia";
import { Judgement } from "../judgement/store";

type Scores = "hitValue" | "hitBonusValue" | "hitBonus" | "hitPunishment";

export const useScoreStore = defineStore("score", () => {
  const judgementScores: Record<Judgement, Record<Scores, number>> = {
    PERFECT: {
      hitValue: 320,
      hitBonusValue: 32,
      hitBonus: 2,
      hitPunishment: 0,
    },
    GREAT: {
      hitValue: 300,
      hitBonusValue: 32,
      hitBonus: 1,
      hitPunishment: 0,
    },
    GOOD: {
      hitValue: 200,
      hitBonusValue: 16,
      hitBonus: 0,
      hitPunishment: 8,
    },
    OK: {
      hitValue: 100,
      hitBonusValue: 8,
      hitBonus: 0,
      hitPunishment: 24,
    },
    MEH: {
      hitValue: 50,
      hitBonusValue: 4,
      hitBonus: 0,
      hitPunishment: 44,
    },
    MISS: {
      hitValue: 0,
      hitBonusValue: 0,
      hitBonus: 0,
      hitPunishment: Infinity,
    },
  };

  const MAX_SCORE = 1_000_000;
  const MOD_MULTIPLIER = 1;
  const MOD_DIVIDER = 1;
  const MIN_BONUS = 0;
  const MAX_BONUS = 100;

  return {
    judgementScores,
    MAX_SCORE,
    MOD_MULTIPLIER,
    MOD_DIVIDER,
    MIN_BONUS,
    MAX_BONUS,
  };
});
