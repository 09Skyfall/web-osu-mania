import perfectImgUrl from "../../../assets/judgment-scores/judgement_perfect.gif";
import greatImgUrl from "../../../assets/judgment-scores/judgement_great.png";
import goodImgUrl from "../../../assets/judgment-scores/judgement_good.png";
import okImgUrl from "../../../assets/judgment-scores/judgement_ok.png";
import mehImgUrl from "../../../assets/judgment-scores/judgement_meh.png";
import missImgUrl from "../../../assets/judgment-scores/judgement_miss.png";
import { RGB } from "../colors/RGB";

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

export const judgementColors: Record<JUDGEMENT, RGB> = {
  [JUDGEMENT.PERFECT]: new RGB(237, 204, 104),
  [JUDGEMENT.GREAT]: new RGB(255, 215, 51),
  [JUDGEMENT.GOOD]: new RGB(101, 195, 1),
  [JUDGEMENT.OK]: new RGB(4, 84, 185),
  [JUDGEMENT.MEH]: new RGB(85, 98, 113),
  [JUDGEMENT.MISS]: new RGB(188, 25, 15),
};

export type Judgement = keyof typeof JUDGEMENT;

export const getJudgementImgSrc = (j: Judgement) => {
  switch (j) {
    case "PERFECT":
      return perfectImgUrl;
    case "GREAT":
      return greatImgUrl;
    case "GOOD":
      return goodImgUrl;
    case "OK":
      return okImgUrl;
    case "MEH":
      return mehImgUrl;
    case "MISS":
      return missImgUrl;
  }
};
