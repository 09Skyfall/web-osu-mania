const OD = 5;

export enum JUDGEMENT {
  PERFECT = "PERFECT",
  GREAT = "GREAT",
  GOOD = "GOOD",
  OK = "OK",
  MEH = "MEH",
  MISS = "MISS",
}

export const JUDGEMENT_WINDOWS = {
  [JUDGEMENT.PERFECT]: 16,
  [JUDGEMENT.GREAT]: 64 - 3 * OD,
  [JUDGEMENT.GOOD]: 97 - 3 * OD,
  [JUDGEMENT.OK]: 127 - 3 * OD,
  [JUDGEMENT.MEH]: 151 - 3 * OD,
  [JUDGEMENT.MISS]: 188 - 3 * OD,
} as const;

export type Judgement = keyof typeof JUDGEMENT;

export const getJudgementImgSrc = (j: Judgement) => {
  const extension = j === JUDGEMENT.PERFECT ? "gif" : "png";
  return `/assets/judgment-scores/judgement_${j.toLowerCase()}.${extension}`;
};
