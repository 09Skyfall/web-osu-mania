const OD = 5;
export const JUDGEMENT_WINDOWS = {
  PERFECT: 16,
  GREAT: 64 - 3 * OD,
  GOOD: 97 - 3 * OD,
  OK: 127 - 3 * OD,
  MEH: 151 - 3 * OD,
  MISS: 188 - 3 * OD,
} as const;

export type Judgement = keyof typeof JUDGEMENT_WINDOWS;
